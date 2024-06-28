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
        QcFlagEffectivePeriodRepository,
    },
} = require('../../../database/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagAdapter, dataPassQcFlagAdapter, simulationPassQcFlagAdapter } = require('../../../database/adapters/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const { getPhysicalDplDetectorOrFail } = require('../dpl/getPhysicalDplDetectorOrFail.js');
const { Op } = require('sequelize');
const { BkpRoles } = require('../../../domain/enums/BkpRoles.js');
const { getOneDataPassOrFail } = require('../dataPasses/getOneDataPassOrFail.js');
const { getOneSimulationPassOrFail } = require('../simulationPasses/getOneSimulationPassOrFail.js');
const { AccessDeniedError } = require('../../errors/AccessDeniedError.js');

/**
 * @typedef UserWithRoles
 * @property {number} userId
 * @property {number} externalUserId
 * @property {string[]} roles
 */

/**
 * Return expert's role for given detector
 * @param {string} detectorName name of detector
 * @return {string} role
 */
const getRoleForDetector = (detectorName) => `det-${detectorName.toLowerCase()}`;

/**
 * Check whether given user's roles suffice to manage QC flags for given detector
 * @param {string[]} userRoles roles of user
 * @param {string} detectorName name of detector
 * @return {void}
 * @throws {AccessDeniedError} when roles doesn't suffice
 */
const validateUserDetectorAccess = (userRoles, detectorName) => {
    if (!userRoles.includes(BkpRoles.ADMIN) && !userRoles.includes(getRoleForDetector(detectorName))) {
        throw new AccessDeniedError(`You have no permission to manage flags for ${detectorName} detector`);
    }
};

/**
 * @typedef RunDetectorQcSummary
 * @property {number} badEffectiveRunCoverage - fraction of run's data, marked explicitely with bad QC flag
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, marked explicitely with good QC flag
 * @property {number} missingVerificationsCount - number of not verified QC flags which are not discarded
 */
const QC_SUMMARY_PROPERTIES = {
    badEffectiveRunCoverage: 'badEffectiveRunCoverage',
    explicitlyNotBadEffectiveRunCoverage: 'explicitlyNotBadEffectiveRunCoverage',
    missingVerificationsCount: 'missingVerificationsCount',
};

/**
 * @typedef RunQcSummary
 * @type {Object<number, QcSummary>} dplDetectorID to QcSummary mappings
 */

/**
 * @typedef QcSummary
 * @type {Object<number, Object<number, QcSummary>>} runNumber to RunQcSummary mapping
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
     * @param {Partial<Period>} timestamps QC flag timestamps
     * @param {Run} targetRun run which for QC flag is to be set
     * @return {{from: (number|null), to: (number|null)}} prepared timestamps
     * @throws {BadParameterError}
     */
    _prepareQcFlagPeriod(timestamps, targetRun) {
        const from = timestamps.from ?? targetRun.startTime ?? null;
        const to = timestamps.to ?? targetRun.endTime ?? null;

        if (from === null || to === null) {
            if (!from && !to) {
                return { from: null, to: null };
            } else {
                throw new BadParameterError('Only null QC flag timestamps are accepted as run.startTime or run.endTime is missing');
            }
        }

        if (from >= to) {
            throw new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp');
        }

        if (from < targetRun.startTime || targetRun.endTime < to) {
            // eslint-disable-next-line max-len
            throw new BadParameterError(`Given QC flag period (${from}, ${to}) is out of run (${targetRun.startTime}, ${targetRun.endTime}) period`);
        }
        return { from, to };
    }

    /**
     * Remove a time segment from a list of QC flags effective periods
     * @param {Period} intersectingPeriod time segment that should be removed from given periods
     * @param {SequelizeQcFlagEffectivePeriod} periods periods to be updated or discarded
     * @return {Promise<void>} resolve once all periods are updated
     */
    async _updateEffectivePeriods({ from: newerPeriodFrom, to: newerPeriodTo }, periods) {
        for (const effectivePeriod of periods) {
            const { id: effectivePeriodId, from: effectiveFrom, to: effectiveTo } = effectivePeriod;

            if (newerPeriodFrom <= effectiveFrom && effectiveTo <= newerPeriodTo) { // Old flag is fully covered by new one
                await QcFlagEffectivePeriodRepository.removeOne({ where: { id: effectivePeriodId } });
            } else if (effectiveFrom < newerPeriodFrom && newerPeriodTo < effectiveTo) { // New flag's period is included in the old one's period
                await QcFlagEffectivePeriodRepository.update(effectivePeriod, { to: newerPeriodFrom });
                await QcFlagEffectivePeriodRepository.insert({
                    flagId: effectivePeriod.flagId,
                    from: newerPeriodTo,
                    to: effectiveTo,
                });
            } else if (effectiveFrom < newerPeriodFrom) {
                await QcFlagEffectivePeriodRepository.update(effectivePeriod, { to: newerPeriodFrom });
            } else if (newerPeriodTo < effectiveTo) {
                await QcFlagEffectivePeriodRepository.update(effectivePeriod, { from: newerPeriodTo });
            } else {
                throw new Error('Incorrect state');
            }
        }
    }

    /**
     * Get QC summary for given data/simulation pass
     * @param {number} dataPassId data pass id - exclusive with simulationPassId
     * @param {number} simulationPassId simulation pass id - exclusive with dataPassId
     * @return {Promise<QcSummary[]>} summary
     */
    async getQcFlagsSummary({ dataPassId, simulationPassId }) {
        if (!dataPassId && !simulationPassId) {
            throw new BadParameterError('Cannot fetch QC flags summary without data pass or simulation pass');
        } else if (dataPassId && simulationPassId) {
            throw new BadParameterError('Cannot fetch QC flags summary for data pass and simulation pass simultaneously');
        }

        const queryBuilder = dataSource.createQueryBuilder();
        if (dataPassId) {
            queryBuilder.whereAssociation('dataPasses', 'id').is(dataPassId);
        } else if (simulationPassId) {
            queryBuilder.whereAssociation('simulationPasses', 'id').is(simulationPassId);
        }

        queryBuilder
            .include({ association: 'effectivePeriods', attributes: [], required: true })
            .include({ association: 'run', attributes: [] })
            .include({ association: 'flagType', attributes: [] })
            .include({ association: 'verifications', attributes: [] })
            .set('attributes', (sequelize) => [
                'runNumber',
                'dplDetectorId',
                [
                    sequelize.literal('SUM(`effectivePeriods`.`to` - `effectivePeriods`.`from`) \
                        / (COALESCE(run.time_trg_end, run.time_o2_end) - COALESCE(run.time_trg_start, run.time_o2_start)) '),
                    'effectiveRunCoverage',
                ],
                [sequelize.col('`flagType`.bad'), 'bad'],
                [
                    sequelize.literal('COUNT( DISTINCT `QcFlag`.id ) - COUNT( DISTINCT `verifications`.flag_id )'),
                    'missingVerificationsCount',
                ],
            ])
            .groupBy('runNumber')
            .groupBy('dplDetectorId')
            .groupBy((sequlize) => sequlize.col('`flagType`.bad'));

        const runDetectorSummaryList = (await QcFlagRepository.findAll(queryBuilder))
            .map((summaryDb) =>
                ({
                    runNumber: summaryDb.runNumber,
                    dplDetectorId: summaryDb.dplDetectorId,
                    effectiveRunCoverage: parseFloat(summaryDb.get('effectiveRunCoverage'), 10),
                    bad: Boolean(summaryDb.get('bad')),
                    missingVerificationsCount: parseInt(summaryDb.get('missingVerificationsCount'), 10),
                }));

        const summary = {};

        // Fold list of summaries into nested object
        for (const runDetectorSunmmary of runDetectorSummaryList) {
            const {
                runNumber,
                dplDetectorId,
                bad,
                effectiveRunCoverage,
                missingVerificationsCount,
            } = runDetectorSunmmary;

            if (!summary[runNumber]) {
                summary[runNumber] = {};
            }

            if (!summary[runNumber][dplDetectorId]) {
                summary[runNumber][dplDetectorId] = {};
            }

            summary[runNumber][dplDetectorId][QC_SUMMARY_PROPERTIES.missingVerificationsCount] =
                (summary[runNumber][dplDetectorId][QC_SUMMARY_PROPERTIES.missingVerificationsCount] ?? 0) + missingVerificationsCount;

            if (bad) {
                summary[runNumber][dplDetectorId][QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = effectiveRunCoverage;
            } else {
                summary[runNumber][dplDetectorId][QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = effectiveRunCoverage;
            }
        }

        return summary;
    }

    /**
     * Create new instance of quality control flags,
     * asynchronous for data/simulation pass or synchronous
     *
     * @param {Partial<QcFlag>[]} qcFlags flags to create
     * @param {object} scope scope of the QC flags to create
     * @param {number} scope.runNumber associated run's number
     * @param {DplDetectorIdentifier} scope.dplDetectorIdentifier associated dplDetector's identifier
     * @param {DataPassIdentifier} [scope.dataPassIdentifier] associated data pass id
     * @param {SimulationPassIdentifier} [scope.simulationPassIdentifier] associated simulation pass id
     * @param {object} relations relations of the QC flag
     * @param {UserWithRoles} relations.user identifier with roles of the user creating the QC flag
     * @return {Promise<QcFlag[]>} resolves with the created QC flags
     * @throws {BadParameterError, NotFoundError}
     */
    async create(qcFlags, scope, relations) {
        const {
            runNumber,
            dataPassIdentifier,
            simulationPassIdentifier,
            dplDetectorIdentifier,
        } = scope;
        const { user: { userId, externalUserId, roles: userRoles = [] } } = relations;

        if (dataPassIdentifier && simulationPassIdentifier) {
            throw new BadParameterError('Cannot create QC flag for data pass and simulation pass simultaneously');
        }

        return dataSource.transaction(async () => {
            const user = await getUserOrFail({ userId, externalUserId });
            const dplDetector = await getPhysicalDplDetectorOrFail(dplDetectorIdentifier);
            const dataPass = dataPassIdentifier ? await getOneDataPassOrFail(dataPassIdentifier) : null;
            const simulationPass = simulationPassIdentifier ? await getOneSimulationPassOrFail(simulationPassIdentifier) : null;

            validateUserDetectorAccess(userRoles, dplDetector.name);

            const targetRun = await this._getQcTargetRun(
                runNumber,
                dplDetector.name,
                { dataPassId: dataPass?.id, simulationPassId: simulationPass?.id },
            );

            const createdFlags = [];
            for (const qcFlag of qcFlags) {
                const { comment, flagTypeId, origin } = qcFlag;
                const { from, to } = this._prepareQcFlagPeriod({ from: qcFlag.from, to: qcFlag.to }, targetRun);

                // Insert
                const newInstance = await QcFlagRepository.insert({
                    from,
                    to,
                    comment,
                    origin,
                    createdById: user.id,
                    flagTypeId,
                    runNumber,
                    dplDetectorId: dplDetector.id,
                });
                await QcFlagEffectivePeriodRepository.insert({
                    flagId: newInstance.id,
                    from: newInstance.from,
                    to: newInstance.to,
                });

                const createdFlag = await QcFlagRepository.findOne(this.prepareQueryBuilder().where('id').is(newInstance.id));

                const flagInclude = [];
                let synchronousQcWhereClause = null;
                if (dataPass) {
                    await createdFlag.addDataPass(dataPass);
                    flagInclude.push({ association: 'dataPasses', where: { id: dataPass.id }, required: true });
                } else if (simulationPass) {
                    await createdFlag.addSimulationPass(simulationPass);
                    flagInclude.push({ association: 'simulationPasses', where: { id: simulationPass.id }, required: true });
                } else {
                    flagInclude.push({ association: 'dataPasses', required: false });
                    flagInclude.push({ association: 'simulationPasses', required: false });
                    synchronousQcWhereClause = { '$flag->dataPasses.id$': null, '$flag->simulationPasses.id$': null };
                }
                // Else synchronous QC flag is created

                const effectivePeriodsToBeUpdated = await QcFlagEffectivePeriodRepository.findAll({
                    subQuery: false,
                    where: {
                        from: { [Op.lt]: createdFlag.to },
                        to: { [Op.gt]: createdFlag.from },
                        ...synchronousQcWhereClause ?? {},
                    },
                    include: [
                        {
                            association: 'flag',
                            include: flagInclude,
                            where: {
                                [Op.and]: [
                                    { [Op.not]: { id: createdFlag.id } },
                                    {
                                        dplDetectorId: dplDetector.id,
                                        runNumber,
                                    },
                                    { createdAt: { [Op.lte]: createdFlag.createdAt } },
                                ],
                            },
                        },
                    ],
                });

                await this._updateEffectivePeriods(createdFlag, effectivePeriodsToBeUpdated);

                createdFlags.push(qcFlagAdapter.toEntity(createdFlag));
            }
            return createdFlags;
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
            const commonDataOrSimulationPassInclude = [ // QC flag can be associated with only one data pass or only one simulation pass
                qcFlag.dataPasses?.length > 0
                    ? { association: 'dataPasses', where: { id: qcFlag.dataPasses[0].id } }
                    : { association: 'simulationPasses', where: { id: qcFlag.simulationPasses[0].id } },
            ];

            const flagsCreatedAfterRemovedFlag = await QcFlagRepository.findAll({
                where: {
                    dplDetectorId: removedFlag.dplDetectorId,
                    runNumber: removedFlag.runNumber,
                    createdAt: { [Op.gt]: qcFlag.createdAt },
                },
                include: commonDataOrSimulationPassInclude,
                sort: [['createdAt', 'ASC']],
            });

            const flagsCreatedBeforeRemovedFlag = await QcFlagRepository.findAll({
                where: {
                    dplDetectorId: removedFlag.dplDetectorId,
                    runNumber: removedFlag.runNumber,
                    createdAt: { [Op.lte]: qcFlag.createdAt },
                },
                include: commonDataOrSimulationPassInclude,
                sort: [['createdAt', 'ASC']],
            });

            /*
             * Restore default effective periods of older flags in order to make update procedure working.
             * It works only in one direction (reducing effective periods) by removing, shorthening, splitting effective periods.
             */
            await QcFlagEffectivePeriodRepository.removeAll({
                where: { flagId: { [Op.in]: flagsCreatedBeforeRemovedFlag.map(({ id }) => id) } },
            });
            await QcFlagEffectivePeriodRepository.insertAll(flagsCreatedBeforeRemovedFlag
                .map(({ id, from, to }) => ({ flagId: id, from, to })));

            // Update effective periods of flags created before removed flag
            for (const newestFlagToBeUpdatedIndex in flagsCreatedBeforeRemovedFlag) {
                const updatingFlagsCreatedBefore = flagsCreatedBeforeRemovedFlag.slice(Number(newestFlagToBeUpdatedIndex) + 1);
                for (const updatingFlag of [...updatingFlagsCreatedBefore, ...flagsCreatedAfterRemovedFlag]) {
                    const effectivePeriods = await QcFlagEffectivePeriodRepository.findAll({
                        where: {
                            from: { [Op.lt]: updatingFlag.to },
                            to: { [Op.gt]: updatingFlag.from },
                        },
                        include: [
                            {
                                association: 'flag',
                                include: commonDataOrSimulationPassInclude,
                                where: {
                                    [Op.and]: [
                                        {
                                            dplDetectorId: updatingFlag.dplDetectorId,
                                            runNumber: updatingFlag.runNumber,
                                        },
                                        { createdAt: { [Op.lt]: updatingFlag.createdAt } },
                                    ],
                                },
                            },
                        ],
                    });
                    await this._updateEffectivePeriods(updatingFlag, effectivePeriods);
                }
            }

            return removedFlag;
        });
    }

    /**
     * Create verification of QC flag
     * @param {Partial<QcFlagVerification>} qcFlagVerification flag verification
     * @param {object} relations QC Flag entity relations
     * @param {UserWithRoles} relations.user user identifier with roles
     * @return {Promise<QcFlag>} promise
     * @throws {NotFoundError|AccessDeniedError}
     */
    async verifyFlag({ flagId, comment }, relations) {
        return dataSource.transaction(async () => {
            const qcFlag = await this.getOneOrFail(flagId);

            const { user: { userId, externalUserId, roles: userRoles = [] } } = relations;
            const user = await getUserOrFail({ userId, externalUserId });

            const dplDetector = await getPhysicalDplDetectorOrFail({ dplDetectorId: qcFlag.dplDetectorId });
            validateUserDetectorAccess(userRoles, dplDetector.name);

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
            .include({ association: 'flagType' })
            .include({ association: 'createdBy' })
            .include({ association: 'verifications', include: [{ association: 'createdBy' }] })
            .orderBy('createdAt', 'DESC', 'verifications');
    }

    /**
     * Find a run with a given run number and including a given detector.
     * Throw if none exists
     * There is exception for `GLO` detector, no run is linked with it.
     *
     * @param {number} runNumber the run number of the run to fetch
     * @param {string} dplDetectorName the name of the detector that the run must include
     * @param {number} [monalisaProduction] MonALISA production, if not specified run will be fetched for synchronous QC flags,
     * for asynchronous otherwise
     * @param {number} [monalisaProduction.dataPassId] the id of the data pass to which run must be linked to
     * @param {number} [monalisaProduction.simulationPassId] the id of the simulation pass to which the run must be linked to
     * @return {Promise<Run>} the found run
     * @private
     */
    async _getQcTargetRun(runNumber, dplDetectorName, { dataPassId, simulationPassId }) {
        const { VIRTUAL_DETECTOR_NAME } = await import('../../../public/domain/enums/detectorsNames.mjs');
        const runInclude = [
            {
                association: 'detectors',
                where: { name: dplDetectorName },
                through: { attributes: [] },
                attributes: [],
                required: dplDetectorName !== VIRTUAL_DETECTOR_NAME.GLO,
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
