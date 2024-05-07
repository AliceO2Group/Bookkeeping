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
        RunRepository,
        QcFlagVerificationRepository,
    },
} = require('../../../database/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagAdapter, dataPassQcFlagAdapter, simulationPassQcFlagAdapter } = require('../../../database/adapters/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { AccessDeniedError } = require('../../errors/AccessDeniedError.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const { getPhysicalDplDetectorOrFail } = require('../dpl/getPhysicalDplDetectorOrFail.js');

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
            throw new NotFoundError(`Quality Control Flag with this id (${id}) could not be found`);
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
     * Create new instance of quality control flag
     *
     * @param {Partial<QcFlag>} qcFlag flag to create
     * @param {object} relations relations of the QC flags to create
     * @param {UserIdentifier} relations.userIdentifier identifier of the user creating the QC flag
     * @param {number} relations.flagTypeId id of the flag type of the flag
     * @param {number} relations.runNumber associated run's number
     * @param {DplDetectorIdentifier} relations.dplDetectorIdentifier associated dplDetector's identifier
     * @param {number} [relations.dataPassId] associated dataPass' id
     * @param {number} [relations.simulationPassId] associated dataPass' id
     * @return {Promise<QcFlag>} resolves with the created QC flag
     * @throws {BadParameterError, NotFoundError}
     */
    async create(qcFlag, relations = {}) {
        const {
            userIdentifier: { userId, externalUserId } = {},
            flagTypeId,
            runNumber,
            dataPassId,
            simulationPassId,
            dplDetectorIdentifier,
        } = relations;

        if (!dataPassId && !simulationPassId) {
            throw new BadParameterError('Cannot create QC flag without data pass or simulation pass');
        }

        return dataSource.transaction(async () => {
            // Check user
            const user = await getUserOrFail({ userId, externalUserId });

            // Check associations
            const dplDetector = await getPhysicalDplDetectorOrFail(dplDetectorIdentifier);

            const targetRun = await this._getRunWithDetectorAndDataOrSimulationPass(
                runNumber,
                dplDetector.name,
                { dataPassId, simulationPassId },
            );

            const { from = null, to = null, comment } = qcFlag;
            const { fromTime, toTime } = this._prepareQcFlagPeriod({ from, to }, targetRun);

            // Insert
            const newInstance = await QcFlagRepository.insert({
                from: fromTime,
                to: toTime,
                comment,
                createdById: user.id,
                flagTypeId,
                runNumber,
                dplDetectorId: dplDetector.id,
            });

            const createdFlag = await QcFlagRepository.findOne(this.prepareQueryBuilder().where('id').is(newInstance.id));

            if (dataPassId) {
                await createdFlag.addDataPasses(targetRun.dataPass);
            }
            if (simulationPassId) {
                await createdFlag.addSimulationPasses(targetRun.simulationPasses);
            }

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

    /**
     * Find a run with a given run number and including a given detector, linked to a given data/simulation pass, and throw if none exists
     *
     * @param {number} runNumber the run number of the run to fetch
     * @param {string} dplDetectorName the name of the detector that the run must include
     * @param {number} dataPassId the id of the data pass to which run must be linked to
     * @param {number} simulationPassId the id of the simulation pass to which the run must be linked to
     * @return {Promise<Run>} the found run
     * @private
     */
    async _getRunWithDetectorAndDataOrSimulationPass(runNumber, dplDetectorName, { dataPassId, simulationPassId }) {
        const runInclude = [
            {
                association: 'detectors',
                where: { name: dplDetectorName },
                through: { attributes: [] },
                attributes: [],
                required: true,
            },
        ];

        if (dataPassId) {
            runInclude.push({
                association: 'dataPass',
                where: { id: dataPassId },
                through: { attributes: [] },
                attributes: ['id'],
                required: true,
            });
        }

        if (simulationPassId) {
            runInclude.push({
                association: 'simulationPasses',
                where: { id: simulationPassId },
                through: { attributes: [] },
                attributes: ['id'],
                required: true,
            });
        }

        const run = await RunRepository.findOne({
            subQuery: false,
            attributes: ['timeTrgStart', 'timeTrgEnd'],
            where: { runNumber },
            include: runInclude,
        });

        if (!run) {
            const criteria = [`run with this number (${runNumber})`, `detector with this name (${dplDetectorName})`];

            if (dataPassId) {
                criteria.push(`data pass with this id (${dataPassId})`);
            }
            if (simulationPassId) {
                criteria.push(`simulation pass with this id (${simulationPassId})`);
            }

            throw new BadParameterError(`There is not association between ${criteria.join(', ')}`);
        }

        return run;
    }
}

module.exports.QcFlagService = QcFlagService;

module.exports.qcFlagService = new QcFlagService();
