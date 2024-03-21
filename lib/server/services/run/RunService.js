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

const { models: { ReasonType } } = require('../../../database');
const { runAdapter } = require('../../../database/adapters/index.js');
const { getRun } = require('./getRun.js');
const { createRun } = require('./createRun.js');
const { updateRun } = require('./updateRun.js');
const { getAllTagsByTextOrFail } = require('../tag/getAllTagsByTextOrFail.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { getOrCreateAllDetectorsByName } = require('../detector/getOrCreateAllDetectorsByName.js');
const { getOrCreateRunType } = require('../runType/getOrCreateRunType.js');
const { utilities: { TransactionHelper } } = require('../../../database');
const { updateRunDetector } = require('../runDetector/updateRunDetector.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { createLog } = require('../log/createLog.js');
const { getTagsByText } = require('../tag/getTagsByText.js');
const { formatServerDate } = require('../../utilities/formatServerDate.js');
const { getRunOrFail } = require('./getRunOrFail.js');
const { getOrCreateLhcPeriod } = require('../lhcPeriod/getOrCreateLhcPeriod.js');
const ReasonTypeRepository = require('../../../database/repositories/ReasonTypeRepository.js');
const EorReasonRepository = require('../../../database/repositories/EorReasonRepository.js');
const { userService } = require('../user/UserService.js');

/**
 * @typedef RunIdentifier object to uniquely identify a run
 * @property {number} [runNumber] the run number
 * @property {number} [runId] the id of the run, ignored if runNumber is present
 */

/**
 * @typedef RunRelationsToInclude object specifying which run relations should be fetched alongside the run
 * @property {boolean} [tags] if true, related tags will be fetched alongside the run
 * @property {boolean} [detectors] if true, related detectors will be fetched alongside the run
 * @property {boolean} [runType] if true, related run type will be fetched alongside the run
 * @property {boolean} [eorReasons] if true, related end of run reasons will be fetched alongside the run
 * @property {boolean} [flpRoles] if true, related flpRoles will be fetched alongside the run
 * @property {boolean} [lhcFill] if true, related lhcFill will be fetched alongside the run
 * @property {boolean} [environment] if true, related environment will be fetched alongside the run
 * @property {boolean|{where: object}} [logs] if true, related logs will be fetched alongside the run
 */

/**
 * Create a log stating the detector's quality change
 *
 * @param {number} runNumber the run number of the run
 * @param {SequelizeRunDetector[]} runDetectors the updated run detector
 * @param {Object} transaction the current transaction
 * @param {User|null} user if not null, the user mentioned in the log as the author of the update
 * @param {string} justification the justification of detector quality change
 * @return {Promise<void>} resolve when log has been created
 * @private
 */
const logRunDetectorQualityChange = async (runNumber, runDetectors, transaction, user, justification) => {
    const headerParts = [`Here are the updated detector's qualities for run ${runNumber}`];
    if (user) {
        headerParts.push(`by ${user.name}`);
    }
    headerParts.push(`(updated ${formatServerDate()}) :`);

    const tags = (await getTagsByText(runDetectors.map(({ detector }) => detector.name))).map(({ text }) => text);

    const textParts = [headerParts.join(' ')];
    for (const runDetector of runDetectors) {
        textParts.push(`- ${runDetector.detector.name}: ${runDetector.quality}`);
    }
    textParts.push(`Reason: ${justification}`);

    const { error } = await createLog(
        {
            title: `Detector(s) quality for run ${runNumber} has been changed`,
            text: textParts.join('\n'),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        tags,
        [],
        [],
        [],
        transaction,
    );
    if (error) {
        // TODO log the failed log creation
    }
};

/**
 * Global service to handle runs instances
 */
class RunService {
    /**
     * Find and return a run by its run number or id
     *
     * @param {RunIdentifier} identifier the identifier of the run to find
     * @param {RunRelationsToInclude} [relations] the relations to include
     * @return {Promise<Run|null>} resolve with the run found or null
     */
    async get(identifier, relations) {
        const run = await getRun(identifier, (queryBuilder) => this._getRunQbConfiguration(queryBuilder, relations));
        return run ? runAdapter.toEntity(run) : null;
    }

    /**
     * Find and return a run by its run number or id, and throws a {@see NotFoundError} if no run is found
     *
     * @param {RunIdentifier} identifier the identifier of the run to find
     * @param {RunRelationsToInclude} [relations] the relations to include
     * @return {Promise<Run>} resolve with the run found or null
     * @throws {NotFoundError} if no run is found
     */
    async getOrFail(identifier, relations) {
        return runAdapter.toEntity(await getRunOrFail(
            identifier,
            (queryBuilder) => this._getRunQbConfiguration(queryBuilder, relations),
        ));
    }

    /**
     * Create a run in the database and return the created instance
     *
     * @param {Partial<Run>} newRun the run to create
     * @param {Object} [relations={}] the run's relations
     * @param {string|null} [relations.runTypeName=null] if not null, the name of the created run's type
     * @return {Promise<Run>} resolve with the created run instance
     */
    async create(newRun, relations) {
        const { runTypeName = null, userO2Start = null, userO2Stop = null } = relations || {};

        const detectors = newRun.detectors
            ? await getOrCreateAllDetectorsByName(newRun.detectors.split(',').map((value) => value.trim()))
            : null;

        let runType = null;
        if (runTypeName) {
            runType = await getOrCreateRunType({ name: runTypeName });
        }

        // Update the users for the run
        newRun.userIdO2Start = (await getOrCreateUser(userO2Start))?.id;
        newRun.userIdO2Stop = (await getOrCreateUser(userO2Stop))?.id;

        const runId = await createRun(runAdapter.toDatabase(newRun), { detectors, runType });

        return this.get({ runId }, { runType: true, detectors: true });
    }

    /**
     * Update the given run
     *
     * @param {RunIdentifier} identifier the identifier of the run to update
     * @param {object} payload the update's payload
     * @param {Partial<Run>} [payload.runPatch] the patch to apply on the run
     * @param {object} [payload.metadata] optional run update's metadata
     * @param {string} [payload.metadata.runQualityChangeReason] if it applies, the reason of the calibration change
     * @param {string} [payload.metadata.calibrationStatusChangeReason] if it applies, the reason of the calibration change
     * @param {string} [payload.metadata.detectorsQualitiesChangeReason] if it applies, the reason of the detector quality change
     * @param {Object} [payload.relations] updates to the run's relations
     * @param {string[]|null} [payload.relations.tagsTexts] if not null, the list of tag texts representing tags to apply to the run (will
     *     replace existing ones)
     * @param {EorReason[]|null} [payload.relations.eorReasons] if not null, the list of end of run reasons to apply to the run (will replace
     *     existing ones)
     * @param {string|null} [payload.relations.runTypeName] if not null, the name of the updated run type
     * @param {UserIdentifier} [payload.relations.userIdentifier] if not null, the identifier of the user requesting the run update
     * @param {{detectorId: number, quality: string}[]} [payload.relations.detectorsQualities] an optional list representing the new quality of
     *     the run's detector (the run must be related to the given detector, the detectors not in this list keep their original quality)
     * @param {string} [payload.relations.lhcPeriodName] if not null, the name of lhc period for which the run should be assigned
     * @return {Promise<Run>} resolve with the resulting run
     */
    async update(identifier, payload) {
        const { runPatch = {}, relations = {}, metadata = {} } = payload;
        const { tagsTexts = null, eorReasons = null, runTypeName = null,
            userIdentifier = {}, detectorsQualities = [], lhcPeriodName = null,
            userO2Start = null, userO2Stop = null } = relations;

        const tags = tagsTexts ? await getAllTagsByTextOrFail(tagsTexts, true) : null;

        if (runTypeName) {
            const runType = await getOrCreateRunType({ name: runTypeName });
            runPatch.runTypeId = runType.id;
        }

        if (lhcPeriodName) {
            const lhcPeriod = await getOrCreateLhcPeriod({ name: lhcPeriodName });
            runPatch.lhcPeriodId = lhcPeriod.id;
        }

        let user = null;
        if (userIdentifier.userId !== undefined || userIdentifier.externalUserId !== undefined) {
            user = await getUserOrFail(userIdentifier);
        }

        // Update the users for the run
        runPatch.userIdO2Start = (await getOrCreateUser(userO2Start))?.id;
        runPatch.userIdO2Stop = (await getOrCreateUser(userO2Stop))?.id;

        await TransactionHelper.provide(async (transaction) => {
            const run = await updateRun(
                identifier,
                { runPatch: runAdapter.toDatabase(runPatch), relations: { tags, user }, metadata },
                transaction,
            );

            // Update EOR reasons if they are provided
            if (eorReasons) {
                await updateEorReasonsOnRun(run.id, user?.name, eorReasons);
            }

            // Update detector qualities if they are provided
            if (detectorsQualities.length > 0) {
                const { detectorsQualitiesChangeReason } = metadata;
                if (!(run.timeTrgEnd ?? run.timeO2End)) {
                    throw new BadParameterError('Detector quality can not be updated on a run that has not ended yet');
                }
                if (!detectorsQualitiesChangeReason) {
                    throw new BadParameterError('Detector quality change reason is required when updating detector quality');
                }

                const updatedRunDetectors = [];
                for (const detectorsQuality of detectorsQualities) {
                    updatedRunDetectors.push(await updateRunDetector(
                        run.runNumber,
                        detectorsQuality.detectorId,
                        { quality: detectorsQuality.quality },
                        transaction,
                    ));
                }

                await logRunDetectorQualityChange(run.runNumber, updatedRunDetectors, transaction, user, detectorsQualitiesChangeReason);
            }
        });

        return this.get(identifier, { tags: true, runType: true, detectors: true, eorReasons: true, lhcPeriod: true });
    }

    /**
     * Configure the given query builder to include the provided relations
     *
     * @param {QueryBuilder} queryBuilder the query builder to complete for relations
     * @param {RunRelationsToInclude} [relations] the relations to include
     * @return {void}
     * @private
     */
    _getRunQbConfiguration(queryBuilder, relations) {
        relations = relations || {};
        if (relations.tags) {
            queryBuilder.include('tags');
        }
        if (relations.detectors) {
            queryBuilder.include('detectors');
        }
        if (relations.runType) {
            queryBuilder.include('runType');
        }
        if (relations.eorReasons) {
            queryBuilder.include({ association: 'eorReasons', include: { model: ReasonType, as: 'reasonType' } });
        }
        if (relations.flpRoles) {
            queryBuilder.include('flpRoles');
        }
        if (relations.lhcFill) {
            queryBuilder.include('lhcFill');
        }
        if (relations.lhcPeriod) {
            queryBuilder.include('lhcPeriod');
        }
    }
}

/**
 * Method to remove existing reason_type - run_id from `eor_reasons` table and insert new ones
 *
 * @param {number} runId - id of the run that is due to be modified
 * @param {string} userName - name of the user editing the EOR reasons
 * @param {EorReasonPatch[]} eorReasonPatches - list of eor_reasons patches to be updated on the RUN
 * @returns {Promise<undefined|Error>} - promise on result of db queries
 */
const updateEorReasonsOnRun = async (runId, userName, eorReasonPatches) => {
    const reasonTypes = await ReasonTypeRepository.findAll();

    /**
     * @type {Map<number|string, number>}
     */
    const reasonTypesMap = new Map(reasonTypes
        .map(({ id, category, title }) => [
            // Set in the same map possibility to index by reasontypeId or by title/category
            [id, id],
            [JSON.stringify([category, title]), id],
        ])
        // Convert the array of two values into 2 values in the main array
        .flat());

    const validPatches = [];
    for (const patch of eorReasonPatches) {
        // Use reasonTypeId if it exists, otherwise use category+title if it exists to get the reasonTypeId
        const reasonTypeId = reasonTypesMap.get(patch.reasonTypeId ?? JSON.stringify([patch.category, patch.title])) ?? null;
        // Add to the validPatches array if valid, if the patch is invalid ignore it
        if (reasonTypeId !== null) {
            // Set the reasonTypeId for further processing
            patch.reasonTypeId = reasonTypeId;
            validPatches.push(patch);
        }
    }

    const toKeepEorReasonsIds = []; // EorReasons with an ID already, means exist in DB;
    /**
     * @type {Partial<SequelizeEorReason>[]}
     */
    const newEorReasons = []; // EorReasons with no ID, need to be added in DB;
    validPatches.forEach(({ id, reasonTypeId, description }) => {
        if (id) {
            toKeepEorReasonsIds.push(id);
        } else {
            newEorReasons.push({ runId, reasonTypeId, description, lastEditedName: userName });
        }
    });
    await EorReasonRepository.removeByRunIdAndKeepIds(runId, toKeepEorReasonsIds);
    await EorReasonRepository.addMany(newEorReasons);
};

/**
 * Method to process a user for the run
 *
 * @param {object|null} userData - user object, either userO2Start or userO2Stop
 * @param {number} [userData.externalId] - external identifier of the user
 * @param {string|null} [userData.name] - name of the user or empty
 * @returns {Promise<User|null>} - returns the id of the user or null if the userData is null
 */
const getOrCreateUser = (userData) => {
    if (userData?.externalId) {
        // Create the user if it does not yet exist
        return userService.getOrCreate({ externalUserId: userData.externalId }, userData.name);
    }
    return null;
};

exports.RunService = RunService;

exports.runService = new RunService();
