/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    repositories: {
        QcFlagRepository,
        DataPassQcFlagRepository,
        SimulationPassQcFlagRepository,
        DplDetectorRepository,
        RunRepository,
        QcFlagVerificationRepository,
        QcFlagEffectivePeriodRepository,
    },
} = require('../../../database/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagAdapter, dataPassQcFlagAdapter, simulationPassQcFlagAdapter } = require('../../../database/adapters/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { AccessDeniedError } = require('../../errors/AccessDeniedError.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const { Op } = require('sequelize');

const NON_QC_DETECTORS = new Set(['TST']);

/**
 * @typedef UserWithRoles
 * @property {number} userId
 * @property {number} externalUserId
 * @property {string[]} roles
 */

/**
 * Quality control flags service
 */
class QcFlagService {
    /**
     * Find an Quality Control Flag by its id
     * @param {number} id identifier of Quality Control Flag
     * @return {QcFlag} a Quality Control Flag
     */
    async getById(id) {
        const queryBuilder = this.prepareQueryBuilder();
        if (!id) {
            throw new BadParameterError('Can not find without Quality Control Flag id');
        }

        queryBuilder.where('id').is(id);

        const qcFlag = await QcFlagRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find an Quality Control Flag by its id
     * @param {number} id id of Quality Control Flag
     * @throws {NotFoundError} in case there is no Quality Control Flag with given id
     * @return {Promise<QcFlag>} a Quality Control Flag
     */
    async getOneOrFail(id) {
        const qcFlag = await this.getById(id);
        if (!qcFlag) {
            const criteriaExpression = `id (${id})`;
            throw new NotFoundError(`Quality Control Flag with this ${criteriaExpression} could not be found`);
        }
        return qcFlag;
    }

    /**
     * Validate QC flag timestamps
     * If null timestamp was provided, given timestamp is replaced by run's startTime or endTime
     * @param {{from: number, to: number}} timestamps QC flag timestamps
     * @param {Run} targetRun run which for QC flag is to be set
     * @throws {BadParameterError}
     * @return {{fromTime: number, toTime: number}} prepared timestamps
     */
    _prepareQcFlagPeriod({ from, to }, targetRun) {
        const fromTime = from ?? targetRun.startTime;
        const toTime = to ?? targetRun.endTime;

        if (!fromTime || !toTime) {
            if (!fromTime && !toTime) {
                return { fromTime: null, toTime: null };
            } else {
                throw new BadParameterError('Only null QC flag timestamps are accepted as run.startTime or run.endTime is missing');
            }
        }

        if (fromTime >= toTime) {
            throw new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp');
        }

        if (fromTime < targetRun.startTime || targetRun.endTime < toTime) {
            // eslint-disable-next-line max-len
            throw new BadParameterError(`Given QC flag period (${fromTime}, ${toTime}) is out of run (${targetRun.startTime}, ${targetRun.endTime}) period`);
        }
        return { fromTime, toTime };
    }

    /**
     * Validate QC flag DPL detector
     *
     * @param {number} dplDetectorId DPL detector
     * @throws {BadParameterError}
     * @return {Promise<DplDetector>}  resolves with the found dpl detector
     */
    async _validateQcFlagDplDetector(dplDetectorId) {
        const dplDetector = await DplDetectorRepository.findOne({ where: { id: dplDetectorId } });
        if (!dplDetector?.name || NON_QC_DETECTORS.has(dplDetector.name)) {
            throw new BadParameterError(`Invalid DPL detector (${dplDetector.name})`);
        }
        return dplDetector;
    }

    /**
     * Make existing flag discarded for certain period dependent on other QC flag
     * @param {QcFlag|SequelizeQcFlag} createdFlag newly created flag
     * @param {QcFlag|SequelizeQcFlag} flagToBePartiallyDiscarded flag to be updated
     * @return {Promise<void>} promise
     */
    async _updateQcOneFlagEffectivePeriods(createdFlag, flagToBePartiallyDiscarded) {
        const { from: newFlagFrom, to: newFlagTo } = createdFlag;

        const { id: flagToBePartiallyDiscardedId, from, to } = flagToBePartiallyDiscarded;
        if (newFlagTo <= from || to <= newFlagFrom) {
            return;
        }

        const ineffectivenesPeriodsOfFlagToBePartiallyDiscarded = await QcFlagEffectivePeriodRepository.findAll({
            where: {
                flagId: flagToBePartiallyDiscardedId,
            },
        });

        const overlappingPeriodIds = [];

        let ineffectiveFrom = Math.max(from, newFlagFrom);
        let ineffectiveTo = Math.min(to, newFlagTo);
        for (const period of ineffectivenesPeriodsOfFlagToBePartiallyDiscarded) {
            const from = period.from.getTime();
            const to = period.to.getTime();

            if (ineffectiveFrom <= from && from <= ineffectiveTo
                || ineffectiveFrom <= to && to <= ineffectiveTo) {
                overlappingPeriodIds.push(period.id);
                ineffectiveFrom = Math.min(from, ineffectiveFrom);
                ineffectiveTo = Math.max(to, ineffectiveTo);
            }
        }

        await QcFlagEffectivePeriodRepository.insert({
            flagId: flagToBePartiallyDiscardedId,
            from: ineffectiveFrom,
            to: ineffectiveTo,
        });
        // Remove periods included in newly created one
        await QcFlagEffectivePeriodRepository.removeAll({ where: { id: { [Op.in]: overlappingPeriodIds } } });
    }

    /**
     * Make existing flags discarded for certain period dependent on other QC flag
     * @param {QcFlag|SequelizeQcFlag} createdFlag newly created flag
     * @param {QcFlag[]|SequelizeQcFlag[]} flagsToBePartiallyDiscarded flags to be updated
     * @return {Promise<void>} promise
     */
    async _updateFlagsEffectivePeriod(createdFlag, flagsToBePartiallyDiscarded) {
        return Promise.all(flagsToBePartiallyDiscarded
            .map((flagToBePartiallyDiscarded) => this._updateQcOneFlagEffectivePeriods(createdFlag, flagToBePartiallyDiscarded)));
    }

    /**
     * Create new instance of quality control flags for data pass
     * @param {Partial<QcFlag>} parameters flag instance parameters
     * @param {object} [relations] QC Flag Type entity relations
     * @param {Partial<UserIdentifier>} [relations.user] user identifiers
     * @param {number} [parameters.flagTypeId] flag type id
     * @param {number} [parameters.runNumber] associated run's number
     * @param {number} [parameters.dataPassId] associated dataPass' id
     * @param {number} [parameters.dplDetectorId] associated dplDetector's id
     * @return {Promise<QcFlag>} promise
     * @throws {BadParameterError, NotFoundError}
     */
    async createForDataPass(parameters, relations = {}) {
        const {
            from = null,
            to = null,
            comment,
        } = parameters;
        const {
            user: { userId, externalUserId } = {},
            flagTypeId,
            runNumber,
            dataPassId,
            dplDetectorId,
        } = relations;

        return dataSource.transaction(async () => {
            // Check user
            const user = await getUserOrFail({ userId, externalUserId });

            // Check associations
            const dplDetector = await this._validateQcFlagDplDetector(dplDetectorId);

            const targetRun = await RunRepository.findOne({
                subQuery: false,
                attributes: ['timeTrgStart', 'timeTrgEnd'],
                where: { runNumber },
                include: [
                    {
                        association: 'dataPass',
                        where: { id: dataPassId },
                        through: { attributes: [] },
                        attributes: ['id'],
                        required: true,
                    },
                    {
                        association: 'detectors',
                        where: { name: dplDetector.name },
                        through: { attributes: [] },
                        attributes: [],
                        required: true,
                    },
                ],
            });
            if (!targetRun) {
                // eslint-disable-next-line max-len
                throw new BadParameterError(`There is not association between data pass with this id (${dataPassId}), run with this number (${runNumber}) and detector with this name (${dplDetector.name})`);
            }

            const { fromTime, toTime } = this._prepareQcFlagPeriod({ from, to }, targetRun);

            // Insert
            const newInstance = await QcFlagRepository.insert({
                from: fromTime,
                to: toTime,
                comment,
                createdById: user.id,
                flagTypeId,
                runNumber,
                dplDetectorId,
            });

            const createdFlag = await QcFlagRepository.findOne(this.prepareQueryBuilder().where('id').is(newInstance.id));

            await createdFlag.addDataPasses(targetRun.dataPass);

            const flagsToBePartiallyDiscarded = await QcFlagRepository.findAll({
                include: [
                    {
                        association: 'dataPasses',
                        where: { id: dataPassId },
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            dplDetectorId,
                            runNumber,
                        },
                        { [Op.not]: { id: createdFlag.id } },
                    ],
                },
            });

            await this._updateFlagsEffectivePeriod(
                createdFlag,
                flagsToBePartiallyDiscarded,
            );

            return qcFlagAdapter.toEntity(createdFlag);
        });
    }

    /**
     * Create new instance of quality control flags for simulation pass
     * @param {Partial<QcFlag>} parameters flag instance parameters
     * @param {object} [relations] QC Flag entity relations
     * @param {Partial<UserIdentifier>} [relations.user] user identifiers
     * @param {number} [parameters.flagTypeId] flag type id
     * @param {number} [parameters.runNumber] associated run's number
     * @param {number} [parameters.simulationPassId] associated simulationPass' id
     * @param {number} [parameters.dplDetectorId] associated dplDetector's id
     * @return {Promise<QcFlag>} promise
     * @throws {BadParameterError, NotFoundError}
     */
    async createForSimulationPass(parameters, relations = {}) {
        const {
            from = null,
            to = null,
            comment,
        } = parameters;
        const {
            user: { userId, externalUserId } = {},
            flagTypeId,
            runNumber,
            simulationPassId,
            dplDetectorId,
        } = relations;

        return dataSource.transaction(async () => {
            // Check user
            const user = await getUserOrFail({ userId, externalUserId });

            // Check associations
            const dplDetector = await this._validateQcFlagDplDetector(dplDetectorId);

            const targetRun = await RunRepository.findOne({
                subQuery: false,
                attributes: ['timeTrgStart', 'timeTrgEnd'],
                where: { runNumber },
                include: [
                    {
                        association: 'simulationPasses',
                        where: { id: simulationPassId },
                        through: { attributes: [] },
                        attributes: ['id'],
                        required: true,
                    },
                    {
                        association: 'detectors',
                        where: { name: dplDetector.name },
                        through: { attributes: [] },
                        attributes: [],
                        required: true,
                    },
                ],
            });
            if (!targetRun) {
                // eslint-disable-next-line max-len
                throw new BadParameterError(`There is not association between simulation pass with this id (${simulationPassId}), run with this number (${runNumber}) and detector with this name (${dplDetector.name})`);
            }

            const { fromTime, toTime } = this._prepareQcFlagPeriod({ from, to }, targetRun);

            // Insert
            const newInstance = await QcFlagRepository.insert({
                from: fromTime,
                to: toTime,
                comment,
                createdById: user.id,
                flagTypeId,
                runNumber,
                dplDetectorId,
            });

            const createdFlag = await QcFlagRepository.findOne(this.prepareQueryBuilder().where('id').is(newInstance.id));

            await createdFlag.addSimulationPasses(targetRun.simulationPasses);

            const flagsToBePartiallyDiscarded = await QcFlagRepository.findAll({
                include: [
                    {
                        association: 'simulationPasses',
                        where: { id: simulationPassId },
                    },
                ],
                where: {
                    [Op.and]: [
                        {
                            dplDetectorId,
                            runNumber,
                        },
                        { [Op.not]: { id: createdFlag.id } },
                    ],
                },
            });

            await this._updateFlagsEffectivePeriod(
                createdFlag,
                flagsToBePartiallyDiscarded,
            );

            return qcFlagAdapter.toEntity(createdFlag);
        });
    }

    /**
     * Delete single instance of QC flag
     * @param {number} id QC flag id
     * @return {Promise<QcFlag>} promise
     */
    async delete(id) {
        return dataSource.transaction(async () => {
            const qcFlag = await QcFlagRepository.findOne({
                where: { id },
                include: [{ association: 'dataPasses' }, { association: 'simulationPasses' }, { association: 'verifications' }],
            });
            if (!qcFlag) {
                throw new NotFoundError(`Quality Control Flag with this id (${id}) could not be found`);
            }

            if (qcFlag.verifications?.length > 0) {
                throw new ConflictError('Cannot delete QC flag which is verified');
            }

            await qcFlag.removeDataPasses(qcFlag.dataPasses);
            await qcFlag.removeSimulationPasses(qcFlag.simulationPasses);
            await QcFlagEffectivePeriodRepository.removeAll({ where: { flagId: qcFlag.id } });
            const removedFlag = await QcFlagRepository.removeOne({ where: { id } });

            // Reconstruct flags ineffectiveness periods
            const flagsCreatedAfterRemovedFlag = await QcFlagRepository.findAll({
                where: {
                    dplDetectorId: removedFlag.dplDetectorId,
                    runNumber: removedFlag.runNumber,
                    createdAt: { [Op.gte]: qcFlag.createdAt.getTime() },
                },
                include: [
                    qcFlag.dataPasses?.length > 0
                        ? { association: 'dataPasses', where: { id: qcFlag.dataPasses[0].id } }
                        : { association: 'simulationPasses', where: { id: qcFlag.simulationPasses[0].id } },
                ],
                sort: [['createdAt', 'ASC']],
            });

            const flagsCreatedBeforeRemovedFlag = await QcFlagRepository.findAll({
                where: {
                    dplDetectorId: removedFlag.dplDetectorId,
                    runNumber: removedFlag.runNumber,
                    createdAt: { [Op.lte]: qcFlag.createdAt.getTime() },
                },
                include: [
                    qcFlag.dataPasses?.length > 0
                        ? { association: 'dataPasses', where: { id: qcFlag.dataPasses[0].id } }
                        : { association: 'simulationPasses', where: { id: qcFlag.simulationPasses[0].id } },
                ],
                sort: [['createdAt', 'ASC']],
            });

            await QcFlagEffectivePeriodRepository.removeAll({
                where: {
                    flagId: { [Op.in]: flagsCreatedBeforeRemovedFlag.map(({ id }) => id) },
                },
            });

            if (flagsCreatedAfterRemovedFlag.length === 0) {
                if (flagsCreatedBeforeRemovedFlag.length >= 2) {
                    const newestFlag = flagsCreatedBeforeRemovedFlag[flagsCreatedBeforeRemovedFlag.length - 1];
                    const olderFlags = flagsCreatedBeforeRemovedFlag.slice(0, flagsCreatedBeforeRemovedFlag.length - 1);
                    await this._updateFlagsEffectivePeriod(newestFlag, olderFlags);
                }
            } else if (flagsCreatedBeforeRemovedFlag.length > 0) {
                // Iterate from oldest to newest flag
                for (const newerFlag of flagsCreatedAfterRemovedFlag) {
                    await this._updateFlagsEffectivePeriod(newerFlag, flagsCreatedBeforeRemovedFlag);
                }
            }

            return removedFlag;
        });
    }

    /**
     * Create verification of QC flag
     * @param {Partial<QcFlagVerification>} qcFlagVerification flag verification
     * @param {object} relations QC Flag entity relations
     * @param {UserIdentifier} relations.user user identifier
     * @return {Promise<QcFlag>} promise
     * @throws {NotFoundError|AccessDeniedError}
     */
    async verifyFlag({ flagId, comment }, relations) {
        return dataSource.transaction(async () => {
            const qcFlag = await this.getOneOrFail(flagId);

            const { user: { userId, externalUserId } } = relations;
            const user = await getUserOrFail({ userId, externalUserId });

            if (qcFlag.createdById === user.id) {
                throw new AccessDeniedError('You cannot verify QC flag created by you');
            }

            await QcFlagVerificationRepository.insert({
                flagId,
                comment,
                createdById: user.id,
            });

            return await this.getOneOrFail(flagId);
        });
    }

    /**
     * Return a paginated list of QC flags related to a given data pass, run and dpl detector
     *
     * @param {object} criteria the QC flag criteria
     * @param {number} criteria.dataPassId the id of the data pass to which QC flag should relate
     * @param {number} criteria.runNumber the run number of the run to which QC flag should relate
     * @param {number} criteria.dplDetectorId the id of the DPL detector to which QC flag should release
     * @param {object} [pagination] the pagination to apply
     * @param {number} [pagination.offset] amount of items to skip
     * @param {number} [pagination.limit] amount of items to fetch
     * @return {Promise<{count, rows: DataPassQcFlag[]}>} paginated list of data pass QC flags
     */
    async getAllPerDataPassAndRunAndDetector({ dataPassId, runNumber, dplDetectorId }, pagination) {
        const { limit, offset } = pagination || {};

        const queryBuilder = dataSource.createQueryBuilder()
            .where('dataPassId').is(dataPassId)
            .include({
                association: 'qcFlag',
                include: [
                    { association: 'flagType' },
                    { association: 'createdBy' },
                    { association: 'verifications', include: [{ association: 'createdBy' }] },
                    { association: 'effectivePeriods' },
                ],
                where: {
                    runNumber,
                    dplDetectorId,
                },
                required: true,
            })
            .set('subQuery', false)
            .orderBy('id', 'DESC', 'qcFlag');

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        // The findAndCountAll function is not working properly with required include and distinct (count only on data pass id)
        const [rows, count] = await Promise.all([
            DataPassQcFlagRepository.findAll(queryBuilder),
            DataPassQcFlagRepository.count(queryBuilder),
        ]);

        return {
            count,
            rows: rows.map(dataPassQcFlagAdapter.toEntity),
        };
    }

    /**
     * Return a paginated list of QC flags related to a given simulation pass, run and dpl detector
     *
     * @param {object} criteria the QC flag criteria
     * @param {number} criteria.simulationPassId the id of the simulation pass to which QC flag should relate
     * @param {number} criteria.runNumber the run number of the run to which QC flag should relate
     * @param {number} criteria.dplDetectorId the id of the DPL detector to which QC flag should release
     * @param {object} [pagination] the pagination to apply
     * @param {number} [pagination.offset] amount of items to skip
     * @param {number} [pagination.limit] amount of items to fetch
     * @return {Promise<{count, rows: SimulationPassQcFlag[]}>} paginated list of simulation pass QC flags
     */
    async getAllPerSimulationPassAndRunAndDetector({ simulationPassId, runNumber, dplDetectorId }, pagination) {
        const { limit, offset } = pagination || {};

        const queryBuilder = dataSource.createQueryBuilder()
            .where('simulationPassId').is(simulationPassId)
            .include({
                association: 'qcFlag',
                include: [
                    { association: 'flagType' },
                    { association: 'createdBy' },
                    { association: 'verifications', include: [{ association: 'createdBy' }] },
                    { association: 'effectivePeriods' },
                ],
                where: {
                    runNumber,
                    dplDetectorId,
                },
                required: true,
            })
            .set('subQuery', false)
            .orderBy('id', 'DESC', 'qcFlag');

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        // The findAndCountAll function is not working properly with required include and distinct (count only on simulation pass id)
        const [rows, count] = await Promise.all([
            SimulationPassQcFlagRepository.findAll(queryBuilder),
            SimulationPassQcFlagRepository.count(queryBuilder),
        ]);

        return {
            count: count,
            rows: rows.map(simulationPassQcFlagAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .set('subQuery', false)
            .include({ association: 'flagType' })
            .include({ association: 'createdBy' })
            .include({ association: 'verifications', include: [{ association: 'createdBy' }] })
            .include({ association: 'effectivePeriods' })
            .groupBy('id');
    }
}

module.exports.QcFlagService = QcFlagService;

module.exports.qcFlagService = new QcFlagService();
