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
const { getQcDetectorOrFail } = require('../detector/getQcDetectorOrFail.js');
const { Op } = require('sequelize');
const { BkpRoles } = require('../../../domain/enums/BkpRoles.js');
const { getOneDataPassOrFail } = require('../dataPasses/getOneDataPassOrFail.js');
const { getOneSimulationPassOrFail } = require('../simulationPasses/getOneSimulationPassOrFail.js');
const { AccessDeniedError } = require('../../errors/AccessDeniedError.js');
const { LogManager } = require('@aliceo2/web-ui');
const { DetectorType } = require('../../../domain/enums/DetectorTypes.js');

/**
 * @typedef UserWithRoles
 * @property {number} [userId]
 * @property {number} [externalUserId]
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
 * Quality control flags service
 */
class QcFlagService {
    /**
     * Constructor
     */
    constructor() {
        this._logger = LogManager.getLogger('QC_FLAG_SERVICE');
    }

    /**
     * Find a Quality Control Flag by its id
     * @param {number} id identifier of Quality Control Flag
     * @return {QcFlag} a Quality Control Flag
     */
    async getById(id) {
        if (!id) {
            throw new BadParameterError('Can not find without Quality Control Flag id');
        }

        const queryBuilder = this.prepareQueryBuilder()
            .where('id').is(id);

        const qcFlag = await QcFlagRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find a Quality Control Flag by its id
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
            const detector = await getQcDetectorOrFail(detectorIdentifier);

            const dataPass = dataPassIdentifier ? await getOneDataPassOrFail(dataPassIdentifier) : null;
            const simulationPass = simulationPassIdentifier ? await getOneSimulationPassOrFail(simulationPassIdentifier) : null;

            validateUserDetectorAccess(userRoles, detector.name);

            const targetRun = await this._getQcTargetRun(
                runNumber,
                detector,
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
                    detectorId: detector.id,
                });
                if (dataPass) {
                    await newInstance.addDataPass(dataPass);
                } else if (simulationPass) {
                    await newInstance.addSimulationPass(simulationPass);
                }

                /** @var {SequelizeQcFlag} createdFlag */
                const createdFlag = await QcFlagRepository.findOne({
                    where: { id: newInstance.id },
                    include: [
                        { association: 'dataPasses' },
                        { association: 'simulationPasses' },
                        { association: 'createdBy' },
                    ],
                });

                // Update effective periods
                const effectivePeriodsToBeUpdated = await QcFlagEffectivePeriodRepository.findOverlappingPeriodsCreatedBeforeLimit(
                    { from, to },
                    createdFlag.createdAt,
                    { dataPassId: dataPass?.id, simulationPassId: simulationPass?.id, runNumber, detectorId: detector.id },
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
                where: { id, deleted: false },
                include: [
                    { association: 'dataPasses' },
                    { association: 'simulationPasses' },
                    { association: 'verifications' },
                    { association: 'createdBy' },
                ],
            });

            if (!qcFlag) {
                throw new NotFoundError(`Not-deleted Quality Control Flag with this id (${id}) could not be found`);
            }

            if (qcFlag.verifications?.length > 0) {
                throw new ConflictError('Cannot delete QC flag which is verified');
            }

            const dataPassId = qcFlag.dataPasses[0]?.id;
            const simulationPassId = qcFlag.simulationPasses[0]?.id;

            const {
                after: flagsCreatedAfterRemovedFlag,
                before: flagsCreatedBeforeRemovedFlag,
            } = await QcFlagRepository.findFlagsCreatedAfterAndBeforeGivenOne(id);

            await QcFlagEffectivePeriodRepository.removeAll({ where: { flagId: id } });
            await QcFlagRepository.update(qcFlag, { deleted: true });

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

                for (const potentiallyOverlappingFlag of [...flagsCreatedBeforeRemovedFlag, ...flagsCreatedAfterRemovedFlag]) {
                    const { id, from, to, createdAt, runNumber, detectorId } = potentiallyOverlappingFlag;
                    const overlappingEffectivePeriods = (await QcFlagEffectivePeriodRepository.findOverlappingPeriodsCreatedBeforeLimit(
                        { from, to },
                        createdAt,
                        { dataPassId, simulationPassId, runNumber, detectorId },
                    )).filter(({ flagId }) => flagId !== id);
                    await this._removeEffectivePeriodsAndPeriodIntersection({ from, to }, overlappingEffectivePeriods);
                }
            }

            {
                const { id, from, to, origin, createdById, runNumber, dplDetectorId, flagTypeId, createdAt } = qcFlag;
                const qcFlagPropertiesToLog = {
                    id,
                    from,
                    to,
                    origin,
                    createdById,
                    runNumber,
                    dplDetectorId,
                    flagTypeId,
                    dataPassId,
                    simulationPassId,
                    createdAt,
                };
                this._logger.infoMessage(`Deleted QC flag with properties: ${JSON.stringify(qcFlagPropertiesToLog)}`);
            }

            return qcFlagAdapter.toEntity(qcFlag);
        });
    }

    /**
     * Delete all the QC flags related to a given data pass
     *
     * @param {number} dataPassId the id of the data pass to which QC flag should relate
     * @return {Promise<number>} resolves once all the QC has been deleted returning the amount of flags deleted
     */
    async deleteAllForDataPass(dataPassId) {
        return dataSource.transaction(async () => {
            // Sequelize destroy requires a where and can't work only using association
            const effectivePeriodIds = (await QcFlagEffectivePeriodRepository.findAll({
                attributes: ['id'],
                include: {
                    association: 'flag',
                    attributes: [],
                    required: true,
                    include: {
                        association: 'dataPasses',
                        attributes: [],
                        required: true,
                        where: {
                            id: dataPassId,
                        },
                    },
                },
                raw: true,
            })).map(({ id }) => id);
            await QcFlagEffectivePeriodRepository.removeAll({ where: { id: { [Op.in]: effectivePeriodIds } } });

            // Sequelize update requires a where and can't work only using association
            const qcFlagIds = (await QcFlagRepository.findAll({
                attributes: ['id'],
                include: {
                    association: 'dataPasses',
                    attributes: [],
                    required: true,
                    where: {
                        id: dataPassId,
                    },
                },
                raw: true,
            })).map(({ id }) => id);

            await QcFlagRepository.updateAll(
                { deleted: true },
                { where: { id: qcFlagIds } },
            );

            return qcFlagIds.length;
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
            if (qcFlag.deleted) {
                throw new Error(`QC flag ${flagId} is already discarded and cannot be verified`);
            }

            const { user: { userId, externalUserId, roles: userRoles = [] } } = relations;
            const user = await getUserOrFail({ userId, externalUserId });

            const detector = await getQcDetectorOrFail({ detectorId: qcFlag.dplDetectorId });
            validateUserDetectorAccess(userRoles, detector.name);

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
                    { association: 'effectivePeriods' },
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
                    { association: 'effectivePeriods' },
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
     * Return a paginated list of synchronous QC flags related to a run and detector
     *
     * @param {object} criteria the QC flag criteria
     * @param {number} criteria.runNumber the run number of the run to which QC flag should relate
     * @param {number} criteria.detectorId the id of the detector to which QC flag should relate
     * @param {object} [pagination] the pagination to apply
     * @param {number} [pagination.offset] amount of items to skip
     * @param {number} [pagination.limit] amount of items to fetch
     * @return {Promise<{count, rows: SynchronousQcFlag[]}>} paginated list of synchronous QC flags
     */
    async getAllSynchronousPerRunAndDetector({ runNumber, detectorId }, pagination) {
        const { limit, offset } = pagination || {};

        const queryParameters = {
            subQuery: false,
            where: {
                runNumber,
                detectorId,
                '$dataPasses.id$': null,
                '$simulationPasses.id$': null,
            },
            include: [
                { association: 'flagType' },
                { association: 'createdBy' },
                { association: 'verifications', include: [{ association: 'createdBy' }] },
                { association: 'dataPasses', required: false },
                { association: 'simulationPasses', required: false },
            ],
            order: [['createdAt', 'DESC'], ['id', 'DESC']],
            limit,
            offset,
        };

        // The findAndCountAll function is not working properly with required include and distinct (count only on simulation pass id)
        const [rows, count] = await Promise.all([
            QcFlagRepository.findAll(queryParameters),
            QcFlagRepository.count(queryParameters),
        ]);

        return {
            count,
            rows: rows.map(qcFlagAdapter.toEntity),
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
     * Validate QC flag timestamps
     * If null timestamp was provided, given timestamp is replaced by run's startTime or endTime
     * @param {Partial<Period>} timestamps QC flag timestamps
     * @param {Run} targetRun run which for QC flag is to be set
     * @return {{from: (number|null), to: (number|null)}} prepared timestamps
     * @throws {BadParameterError}
     */
    _prepareQcFlagPeriod(timestamps, targetRun) {
        const { qcTimeStart, qcTimeEnd } = targetRun;
        const runStart = qcTimeStart?.getTime();
        const runEnd = qcTimeEnd?.getTime();

        const { from, to } = timestamps;

        if (from && to && from >= to) {
            throw new BadParameterError('Parameter "to" timestamp must be greater than "from" timestamp');
        }

        const isFromOutOfRange = from && (runStart && from < runStart || runEnd && runEnd <= from);
        const isToOutOfRange = to && (runStart && to <= runStart || runEnd && runEnd < to);
        if (isFromOutOfRange || isToOutOfRange) {
            throw new BadParameterError(`Given QC flag period (${from}, ${to}) is out of run (${runStart}, ${runEnd}) period`);
        }

        return { from, to };
    }

    /**
     * Remove a time segment from a list of QC flags effective periods
     *
     * @param {Partial<Period>} eraseWindow time segment that should be removed from given periods
     * @param {SequelizeQcFlagEffectivePeriod[]} periods effective periods from which time window should be erased
     * @return {Promise<void>} resolve once all periods are updated
     */
    async _removeEffectivePeriodsAndPeriodIntersection(eraseWindow, periods) {
        /*
         * Example of what is named `before` and `after` an erase window:
         *
         * ------------------------------[ erase window ]----------------------------> time
         * [ period BEFORE erase window ]                [ period AFTER erase window ]
         *
         * When erasing time segment from the following QC flag (using the erase window from above):
         * ---------------------[        QC flag period         ]--------------------
         *
         * Resultant effective sub-periods of the QC flag will be:
         * ---------------------[       ]-------------------------------------------- => sub-period BEFORE erase window
         * ----------------------------------------------[      ]-------------------- => sub-period AFTER erase window
         *
         * Analogously, for the the following flag would have no sub-period after:
         * ----------------[ QC flag period ]----------------------------------------
         * ----------------[            ]-------------------------------------------- => sub-period BEFORE erase window
         *
         * And the following flag would have no sub-period before
         * ---------------------------------------[ QC flag period ]-----------------
         * ----------------------------------------------[         ]----------------- => sub-period AFTER erase window
         */

        /**
         * Return the sub-period left before the erase window
         *
         * @param {Partial<Period>} period the period from which a time segment is to be removed
         * @param {Partial<Period>} eraseWindow the erase window
         * @return {Partial<Period>|null} the resulting sub-period, if it exists
         */
        const getPeriodBeforeEraseWindow = (period, eraseWindow) => {
            if (
                eraseWindow.from === null
                || period.from !== null && period.from.getTime() >= eraseWindow.from // Period started after erase window from
            ) {
                return null;
            }

            return {
                from: period.from?.getTime(),
                // If period.to is null, simply goes to eraseWindow.from
                to: Math.min(period.to?.getTime() ?? eraseWindow.from, eraseWindow.from),
            };
        };

        /**
         * Return the sub-period left after the erase window
         *
         * @param {Partial<Period>} period the period from which a time segment is to be removed
         * @param {Partial<Period>} eraseWindow the erase window
         * @return {Partial<Period>|null} the resulting sub-period, if it exists
         */
        const getPeriodAfterEraseWindow = (period, eraseWindow) => {
            if (
                eraseWindow.to === null
                || period.to !== null && period.to.getTime() <= eraseWindow.to
            ) {
                return null;
            }

            return {
                from: Math.max(period.from?.getTime() ?? eraseWindow.to, eraseWindow.to), // If period.from is null, start from eraseWindow.to
                to: period.to?.getTime(),
            };
        };
        for (const period of periods) {
            // Consider what effective period is left before the erase window
            const periodBeforeEraseWindow = getPeriodBeforeEraseWindow(period, eraseWindow);

            // Consider what effective period is left after the erase window
            const periodAfterEraseWindow = getPeriodAfterEraseWindow(period, eraseWindow);

            /*
             * Four cases:
             * - Empty sub-periods before and after => delete the whole effective period
             * - Empty sub-period before and non-empty after => crop `from`
             * - Empty sub-period after and non-empty before => crop `to`
             * - two non-empty sub-periods => split the effective period in two,
             *   actually keeping the existing one as `before` and creating `after`
             */
            if (periodBeforeEraseWindow === null && periodAfterEraseWindow === null) { // Old flag is fully covered by new one
                await QcFlagEffectivePeriodRepository.removeOne({ where: { id: period.id } });
            } else if (periodBeforeEraseWindow === null) {
                await QcFlagEffectivePeriodRepository.update(period, { from: periodAfterEraseWindow.from });
            } else if (periodAfterEraseWindow === null) {
                await QcFlagEffectivePeriodRepository.update(period, { to: periodBeforeEraseWindow.to });
            } else {
                await QcFlagEffectivePeriodRepository.update(period, { to: periodBeforeEraseWindow.to }); // Reuse the existing one
                await QcFlagEffectivePeriodRepository.insert({
                    flagId: period.flagId,
                    from: periodAfterEraseWindow.from,
                    to: periodAfterEraseWindow.to,
                });
            }
        }
    }

    /**
     * Find a run with a given run number and including a given detector.
     * Throw if none exists
     * There is exception for `GLO` detector, no run is linked with it.
     *
     * @param {number} runNumber the run number of the run to fetch
     * @param {Detector} detector detector that the run must include if it is PHYSICAL
     * @param {number} [monalisaProduction] MonALISA production, if not specified run will be fetched for synchronous QC flags,
     * for asynchronous otherwise
     * @param {number} [monalisaProduction.dataPassId] the id of the data pass to which run must be linked to
     * @param {number} [monalisaProduction.simulationPassId] the id of the simulation pass to which the run must be linked to
     * @return {Promise<Run>} the found run
     * @private
     */
    async _getQcTargetRun(runNumber, detector, { dataPassId, simulationPassId }) {
        const runInclude = [
            {
                association: 'detectors',
                where: { id: detector.id },
                through: { attributes: [] },
                attributes: [],
                required: detector.type === DetectorType.PHYSICAL,
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
            attributes: ['qcTimeStart', 'qcTimeEnd'],
            where: { runNumber },
            include: runInclude,
        });

        if (!run) {
            const criteria = [`run with this number (${runNumber})`, `detector with this name (${detector.name})`];

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
