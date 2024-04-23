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
        QcFlagIneffectivenessPeriodRepository,
    },
} = require('../../../database/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagAdapter, dataPassQcFlagAdapter, simulationPassQcFlagAdapter } = require('../../../database/adapters/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { AccessDeniedError } = require('../../errors/AccessDeniedError.js');
const { BkpRoles } = require('../../../domain/enums/BkpRoles.js');
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
     * Make existing flags ineffective for certain period dependent on newly created one
     * @param {QcFlag} createdFlag newly created flag
     * @param {SequelizeQcFlag[]} flagsToBePartiallyDiscarded flags to be updated
     * @return {Promise<void>} promise
     */
    async _updatePreviousFlagsEffectiveness(createdFlag, flagsToBePartiallyDiscarded) {
        const { from: newFlagFrom, to: newFlagTo } = createdFlag;

        for (const partiallyDiscardFlag of flagsToBePartiallyDiscarded) {
            const { id: discardedFlagId, from, to } = qcFlagAdapter.toEntity(partiallyDiscardFlag);
            if (newFlagTo <= from || to <= newFlagFrom) {
                continue;
            }

            const ineffectiveFrom = Math.max(from, newFlagFrom);
            const ineffectiveTo = Math.max(to, newFlagTo);

            const currentIneffectivenesPeriods = await QcFlagIneffectivenessPeriodRepository.findAll({
                where: {
                    flagId: discardedFlagId,
                },
            });
            const overllapingPeriods = [];

            let appliedIneffectiveFrom = ineffectiveFrom;
            let appliedIneffectiveTo = ineffectiveTo;
            for (const period of currentIneffectivenesPeriods) {
                const { from, to } = period;
                if (appliedIneffectiveFrom <= from && from <= appliedIneffectiveTo
                    || appliedIneffectiveFrom <= to && to <= appliedIneffectiveTo) {
                    overllapingPeriods.push(period);
                    appliedIneffectiveFrom = Math.min(from, appliedIneffectiveFrom);
                    appliedIneffectiveTo = Math.max(to, appliedIneffectiveTo);
                }
            }

            await QcFlagIneffectivenessPeriodRepository.insert({
                flagId: discardedFlagId,
                from: appliedIneffectiveFrom,
                to: appliedIneffectiveTo,
            });

            for (const period of overllapingPeriods) {
                await QcFlagIneffectivenessPeriodRepository.removeOne({ where: { id: period.id } });
            }
        }
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
                order: [['createdAt', 'DESC']],
            });

            const adaptedCreatedQcFlag = qcFlagAdapter.toEntity(createdFlag);
            await this._updatePreviousFlagsEffectiveness(adaptedCreatedQcFlag, flagsToBePartiallyDiscarded);

            return adaptedCreatedQcFlag;
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
                where: [
                    {
                        dplDetectorId,
                        runNumber,
                    },
                    { [Op.not]: { id: createdFlag.id } },
                ],
                order: [['createdAt', 'DESC']],
            });

            await this._updatePreviousFlagsEffectiveness(createdFlag, flagsToBePartiallyDiscarded);

            return qcFlagAdapter.toEntity(createdFlag);
        });
    }

    /**
     * Delete single instance of QC flag
     * @param {number} id QC flag id
     * @param {object} relations QC Flag entity relations
     * @param {UserWithRoles} relations.userWithRoles user with roles
     * @return {Promise<QcFlag>} promise
     */
    async delete(id, relations) {
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

            const { userWithRoles: { userId, externalUserId, roles = [] } } = relations;
            const user = await getUserOrFail({ userId, externalUserId });

            if (qcFlag.createdById !== user.id && !roles.includes(BkpRoles.ADMIN)) {
                throw new AccessDeniedError('You are not allowed to remove this QC flag');
            }

            await qcFlag.removeDataPasses(qcFlag.dataPasses);
            await qcFlag.removeSimulationPasses(qcFlag.simulationPasses);
            return QcFlagRepository.removeOne({ where: { id } });
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
            .groupBy('id');
    }
}

module.exports.QcFlagService = QcFlagService;

module.exports.qcFlagService = new QcFlagService();
