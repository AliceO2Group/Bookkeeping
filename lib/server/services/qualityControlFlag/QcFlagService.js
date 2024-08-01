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
 * @property {boolean} mcReproducible - states whether some Limited Acceptance MC Reproducible flag was assigned
 */
const QC_SUMMARY_PROPERTIES = {
    badEffectiveRunCoverage: 'badEffectiveRunCoverage',
    explicitlyNotBadEffectiveRunCoverage: 'explicitlyNotBadEffectiveRunCoverage',
    missingVerificationsCount: 'missingVerificationsCount',
    mcReproducible: 'mcReproducible',
};

/**
 * @typedef RunQcSummary
 * @type {Object<number, RunDetectorQcSummary>} dplDetectorID to RunDetectorQcSummary mappings
 */

/**
 * @typedef QcSummary
 * @type {Object<number, Object<number, RunQcSummary>>} runNumber to RunQcSummary mapping
 */

/**
 * @typedef GaqFlags
 *
 * @property {number} from
 * @property {number} to
 * @property {QcFlag[]} contributingFlags
 */

/**
 * @typedef RunGaqSummary
 * @property {number} badEffectiveRunCoverage - fraction of run's data, which aggregated quality is bad
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, which aggregated quality is explicitly good
 * @property {number} missingVerificationsCount - number of not verified QC flags which are not discarded
 * @property {boolean} mcReproducible - states whether some aggregation of QC flags is Limited Acceptance MC Reproducible
 */

/**
 * @typedef GaqSummary aggregated global quality summaries for given data pass
 * @type {Object<number, RunGaqSummary>} runNumber to RunGaqSummary mapping
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
        const { timeTrgStart, timeO2Start, timeTrgEnd, timeO2End } = targetRun;
        const runStartTime = timeTrgStart?.getTime() ?? timeO2Start?.getTime() ?? null;
        const runEndTime = timeTrgEnd?.getTime() ?? timeO2End?.getTime() ?? null;

        const from = timestamps.from ?? runStartTime ?? null;
        const to = timestamps.to ?? runEndTime ?? null;

        if (from && to && from >= to) {
            throw new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp');
        }
        const isFromOutOfRange = from && (runStartTime && from < runStartTime || runEndTime && runEndTime <= from);
        const isToOutOfRange = to && (runStartTime && to <= runStartTime || runEndTime && runEndTime < to);
        if (isFromOutOfRange || isToOutOfRange) {
            throw new BadParameterError(`Given QC flag period (${from}, ${to}) is out of run (${runStartTime}, ${runEndTime}) period`);
        }

        return { from, to };
    }

    /**
     * Remove a time segment from a list of QC flags effective periods
     *
     * @param {Period} intersectingPeriod time segment that should be removed from given periods
     * @param {SequelizeQcFlagEffectivePeriod} periods periods to be updated or discarded
     * @return {Promise<void>} resolve once all periods are updated
     */
    async _removeEffectivePeriodsAndPeriodIntersection({ from: newerPeriodFrom, to: newerPeriodTo }, periods) {
        for (const effectivePeriod of periods) {
            const { id: effectivePeriodId, from: effectiveFrom, to: effectiveTo } = effectivePeriod;

            const effectiveToIsLesserOrEqNewerPeriodTo = newerPeriodTo === null || effectiveTo !== null && effectiveTo <= newerPeriodTo;

            if (newerPeriodFrom <= effectiveFrom
                && effectiveToIsLesserOrEqNewerPeriodTo) { // Old flag is fully covered by new one
                await QcFlagEffectivePeriodRepository.removeOne({ where: { id: effectivePeriodId } });
            } else if (effectiveFrom < newerPeriodFrom && !effectiveToIsLesserOrEqNewerPeriodTo) {
                // New flag's period is included in the old one's period.
                await QcFlagEffectivePeriodRepository.update(effectivePeriod, { to: newerPeriodFrom });
                await QcFlagEffectivePeriodRepository.insert({
                    flagId: effectivePeriod.flagId,
                    from: newerPeriodTo,
                    to: effectiveTo,
                });
            } else if (effectiveFrom < newerPeriodFrom) {
                await QcFlagEffectivePeriodRepository.update(effectivePeriod, { to: newerPeriodFrom });
            } else if (!effectiveToIsLesserOrEqNewerPeriodTo) {
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
                'detectorId',
                [sequelize.col('`flagType`.bad'), 'bad'],

                [
                    sequelize.literal(`
                    IF(
                        (
                            COALESCE(run.time_trg_end,   run.time_o2_end  ) IS NULL
                         OR COALESCE(run.time_trg_start, run.time_o2_start) IS NULL
                        ),
                        IF(
                            SUM(
                                COALESCE(UNIX_TIMESTAMP(effectivePeriods.\`to\`  ), 0)
                              + COALESCE(UNIX_TIMESTAMP(effectivePeriods.\`from\`), 0)
                            ) = 0,
                            1,
                            null
                        ),
                        SUM(
                            UNIX_TIMESTAMP(COALESCE(
                                effectivePeriods.\`to\`,
                                run.time_trg_end,
                                run.time_o2_end
                            ))
                          - UNIX_TIMESTAMP(COALESCE(
                                effectivePeriods.\`from\`,
                                run.time_trg_start,
                                run.time_o2_start
                            ))
                        ) / (
                            UNIX_TIMESTAMP(COALESCE(run.time_trg_end,   run.time_o2_end))
                          - UNIX_TIMESTAMP(COALESCE(run.time_trg_start, run.time_o2_start))
                        )
                    )
                `),
                    'effectiveRunCoverage',
                ],
                [
                    sequelize.literal('COUNT( DISTINCT `QcFlag`.id ) - COUNT( DISTINCT `verifications`.flag_id )'),
                    'missingVerificationsCount',
                ],
                [
                    sequelize.literal('SUM( `flagType`.monte_carlo_reproducible ) > 0'),
                    'mcReproducible',
                ],
            ])
            .groupBy('runNumber')
            .groupBy('detectorId')
            .groupBy((sequlize) => sequlize.col('`flagType`.bad'));

        const runDetectorSummaryList = (await QcFlagRepository.findAll(queryBuilder))
            .map((summaryDb) =>
                ({
                    runNumber: summaryDb.runNumber,
                    detectorId: summaryDb.detectorId,
                    effectiveRunCoverage: parseFloat(summaryDb.get('effectiveRunCoverage'), 10) || null,
                    bad: Boolean(summaryDb.get('bad')),
                    missingVerificationsCount: parseInt(summaryDb.get('missingVerificationsCount'), 10),
                    mcReproducible: Boolean(summaryDb.get('mcReproducible')),
                }));

        const summary = {};

        // Fold list of summaries into nested object
        for (const runDetectorSunmmary of runDetectorSummaryList) {
            const {
                runNumber,
                detectorId,
                bad,
                effectiveRunCoverage,
                missingVerificationsCount,
                mcReproducible,
            } = runDetectorSunmmary;

            if (!summary[runNumber]) {
                summary[runNumber] = {};
            }

            if (!summary[runNumber][detectorId]) {
                summary[runNumber][detectorId] = {
                    [QC_SUMMARY_PROPERTIES.mcReproducible]: false,
                };
            }

            const runDetectorSummary = summary[runNumber][detectorId];

            runDetectorSummary[QC_SUMMARY_PROPERTIES.missingVerificationsCount] =
                (runDetectorSummary[QC_SUMMARY_PROPERTIES.missingVerificationsCount] ?? 0) + missingVerificationsCount;

            if (bad) {
                runDetectorSummary[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = effectiveRunCoverage;
                runDetectorSummary[QC_SUMMARY_PROPERTIES.mcReproducible] = mcReproducible;
            } else {
                runDetectorSummary[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = effectiveRunCoverage;
            }
            if (runDetectorSummary[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] === undefined) {
                runDetectorSummary[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = 0;
            }
            if (runDetectorSummary[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] === undefined) {
                runDetectorSummary[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = 0;
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
     * @param {DplDetectorIdentifier} scope.detectorIdentifier associated dplDetector's identifier
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
            detectorIdentifier,
        } = scope;
        const { user: { userId, externalUserId, roles: userRoles = [] } } = relations;

        if (dataPassIdentifier && simulationPassIdentifier) {
            throw new BadParameterError('Cannot create QC flag for data pass and simulation pass simultaneously');
        }

        return dataSource.transaction(async () => {
            const user = await getUserOrFail({ userId, externalUserId });
            const dplDetector = await getPhysicalDplDetectorOrFail(detectorIdentifier);
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
                    detectorId: dplDetector.id,
                });
                if (dataPass) {
                    await newInstance.addDataPass(dataPass);
                } else if (simulationPass) {
                    await newInstance.addSimulationPass(simulationPass);
                }

                const createdFlag = await QcFlagRepository.findOne({
                    where: { id: newInstance.id },
                    include: [
                        { association: 'dataPasses' },
                        { association: 'simulationPasses' },
                        { association: 'createdBy' },
                    ],
                });

                // Update effective periods
                const effectivePeriodsToBeUpdated = await QcFlagEffectivePeriodRepository.findOverlappingPeriodsCreatedNotAfter(
                    { from, to },
                    createdFlag.createdAt,
                    { dataPassId: dataPass?.id, simulationPassId: simulationPass?.id, runNumber, detectorId: dplDetector.id },
                );
                await this._removeEffectivePeriodsAndPeriodIntersection(createdFlag, effectivePeriodsToBeUpdated);

                await QcFlagEffectivePeriodRepository.insert({
                    flagId: newInstance.id,
                    from: newInstance.from,
                    to: newInstance.to,
                });

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

            const dataPassId = qcFlag.dataPasses[0]?.id;
            const simulationPassId = qcFlag.simulationPasses[0]?.id;

            if (!qcFlag) {
                throw new NotFoundError(`Quality Control Flag with this id (${id}) could not be found`);
            }

            if (qcFlag.verifications?.length > 0) {
                throw new ConflictError('Cannot delete QC flag which is verified');
            }

            const { after: flagsCreatedAfterRemovedFlag, before: flagsCreatedBeforeRemovedFlag } =
                await QcFlagRepository.findFlagsCreatedAfterAndBeforeGivenOne(id);

            await qcFlag.removeDataPasses(qcFlag.dataPasses);
            await qcFlag.removeSimulationPasses(qcFlag.simulationPasses);
            await QcFlagEffectivePeriodRepository.removeAll({ where: { flagId: id } });
            await QcFlagRepository.removeOne({ where: { id } });

            // Remove all effective periods of flags created before the deleted one
            await QcFlagEffectivePeriodRepository.removeAll({
                where: { flagId: { [Op.in]: flagsCreatedBeforeRemovedFlag.map(({ id }) => id) } },
            });

            while (flagsCreatedBeforeRemovedFlag.length) {
                const flagWhichEffectivePeriodsAreToBeRecomputed = flagsCreatedBeforeRemovedFlag.shift();
                await QcFlagEffectivePeriodRepository.insert({
                    flagId: flagWhichEffectivePeriodsAreToBeRecomputed.id,
                    from: flagWhichEffectivePeriodsAreToBeRecomputed.from,
                    to: flagWhichEffectivePeriodsAreToBeRecomputed.to,
                });

                for (const potentiallyOverlapingFlag of [...flagsCreatedBeforeRemovedFlag, ...flagsCreatedAfterRemovedFlag]) {
                    const { id, from, to, createdAt, runNumber, detectorId } = potentiallyOverlapingFlag;
                    const overlapingEffectivePeriods = (await QcFlagEffectivePeriodRepository.findOverlappingPeriodsCreatedNotAfter(
                        { from, to },
                        createdAt,
                        { dataPassId, simulationPassId, runNumber, detectorId },
                    )).filter(({ flagId }) => flagId !== id);
                    await this._removeEffectivePeriodsAndPeriodIntersection({ from, to }, overlapingEffectivePeriods);
                }
            }

            return qcFlagAdapter.toEntity(qcFlag);
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

            const dplDetector = await getPhysicalDplDetectorOrFail({ detectorId: qcFlag.dplDetectorId });
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
     * @param {number} criteria.detectorId the id of the DPL detector to which QC flag should release
     * @param {object} [pagination] the pagination to apply
     * @param {number} [pagination.offset] amount of items to skip
     * @param {number} [pagination.limit] amount of items to fetch
     * @return {Promise<{count, rows: DataPassQcFlag[]}>} paginated list of data pass QC flags
     */
    async getAllPerDataPassAndRunAndDetector({ dataPassId, runNumber, detectorId }, pagination) {
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
                    detectorId,
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
     * Find QC flags in GAQ effective periods for given data pass and run
     *
     * @param {number} dataPassId id od data pass
     * @param {number} runNumber run number
     * @return {Promise<GaqFlags[]>} promise of aggregated QC flags
     */
    async getGaqFlags(dataPassId, runNumber) {
        const gaqPeriods = await QcFlagRepository.findGaqPeriods(dataPassId, runNumber);
        const qcFlags = (await QcFlagRepository.findAll({
            where: { id: { [Op.in]: gaqPeriods.flatMap(({ contributingFlagIds }) => contributingFlagIds) } },
            include: [
                { association: 'flagType' },
                { association: 'createdBy' },
                { association: 'verifications', include: [{ association: 'createdBy' }] },
            ],
        })).map(qcFlagAdapter.toEntity);

        const idToFlag = Object.fromEntries(qcFlags.map((flag) => [flag.id, flag]));

        return gaqPeriods.map(({
            contributingFlagIds,
            from,
            to,
        }) => ({
            from,
            to,
            contributingFlags: contributingFlagIds.map((id) => idToFlag[id]),
        }));
    }

    /**
     * Get GAQ summary
     *
     * @param {number} dataPassId id of data pass id
     * @return {Promise<GaqSummary[]>} Resolves with the GAQ Summary
     */
    async getGaqSummary(dataPassId) {
        const runGaqSubSummaries = await QcFlagRepository.getRunGaqSubSummaries(dataPassId);

        const summary = {};
        const flagsAndVerifications = {};

        // Fold list of subSummaries into one summary
        for (const subSummary of runGaqSubSummaries) {
            const {
                runNumber,
                bad,
                effectiveRunCoverage,
                flagsIds,
                verifiedFlagsIds,
                mcReproducible,
            } = subSummary;

            if (!summary[runNumber]) {
                summary[runNumber] = { [QC_SUMMARY_PROPERTIES.mcReproducible]: false };
            }
            if (!flagsAndVerifications[runNumber]) {
                flagsAndVerifications[runNumber] = {};
            }

            const runSummary = summary[runNumber];
            const runFlagsAndVerifications = flagsAndVerifications[runNumber];

            const runFlagsIds = flagsAndVerifications[runNumber]?.flagsIds ?? [];
            const runVerifiedFlagsIds = flagsAndVerifications[runNumber]?.verifiedFlagsIds ?? [];

            flagsAndVerifications[runNumber] = {
                flagsIds: new Set([...runFlagsIds, ...flagsIds]),
                verifiedFlagsIds: new Set([ runVerifiedFlagsIds, ...verifiedFlagsIds])
            };
            runFlagsAndVerifications.verifiedFlagsIds = new Set([...runFlagsAndVerifications?.verifiedFlagsIds ?? [], ...verifiedFlagsIds]);

            if (bad) {
                runSummary[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = parseFloat(effectiveRunCoverage);
                runSummary[QC_SUMMARY_PROPERTIES.mcReproducible] = mcReproducible;
            } else {
                runSummary[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = parseFloat(effectiveRunCoverage);
            }
            if (runSummary[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] === undefined) {
                runSummary[QC_SUMMARY_PROPERTIES.badEffectiveRunCoverage] = 0;
            }
            if (runSummary[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] === undefined) {
                runSummary[QC_SUMMARY_PROPERTIES.explicitlyNotBadEffectiveRunCoverage] = 0;
            }
        }

        for (const [runNumber, { flagsIds, verifiedFlagsIds }] of Object.entries(flagsAndVerifications)) {
            summary[runNumber][QC_SUMMARY_PROPERTIES.missingVerificationsCount] = flagsIds.size - verifiedFlagsIds.size;
        }

        return summary;
    }

    /**
     * Return a paginated list of QC flags related to a given simulation pass, run and dpl detector
     *
     * @param {object} criteria the QC flag criteria
     * @param {number} criteria.simulationPassId the id of the simulation pass to which QC flag should relate
     * @param {number} criteria.runNumber the run number of the run to which QC flag should relate
     * @param {number} criteria.detectorId the id of the DPL detector to which QC flag should release
     * @param {object} [pagination] the pagination to apply
     * @param {number} [pagination.offset] amount of items to skip
     * @param {number} [pagination.limit] amount of items to fetch
     * @return {Promise<{count, rows: SimulationPassQcFlag[]}>} paginated list of simulation pass QC flags
     */
    async getAllPerSimulationPassAndRunAndDetector({ simulationPassId, runNumber, detectorId }, pagination) {
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
                    detectorId,
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
