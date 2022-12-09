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
const { runAdapter, eorReasonAdapter } = require('../../../database/adapters/index.js');
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

/**
 * @typedef RunIdentifier object to uniquely identify a run
 * @property {number} [runNumber] the run number
 * @property {number} [runId] the id of the run, ignored if runNumber is present
 */

/**
 * Create a log stating the detector's quality change
 *
 * @param {number} runNumber the run number of the run
 * @param {SequelizeRunDetector[]} runDetectors the updated run detector
 * @param {Object} transaction the current transaction
 * @param {User|null} user if not null, the user mentioned in the log as the author of the update
 * @return {Promise<void>} resolve when log has been created
 * @private
 */
const logQualityChange = async (runNumber, runDetectors, transaction, user) => {
    const headerParts = [`Here are the updated detector's qualities for run ${runNumber}`];
    if (user) {
        headerParts.push(`by ${user.name}`);
    }
    headerParts.push(`(updated on ${formatServerDate()}`);
    headerParts.push(`at ${formatServerDate()} UTC) :`);

    const tags = (await getTagsByText(runDetectors.map(({ detector }) => detector.name))).map(({ text }) => text);

    const textParts = [headerParts.join(' ')];
    for (const runDetector of runDetectors) {
        textParts.push(`- ${runDetector.detector.name}: ${runDetector.quality}`);
    }

    const { error } = await createLog(
        {
            title: `Detector's quality for run ${runNumber} has been changed`,
            text: textParts.join('\n'),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        tags,
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
     * @param {Object} [relations] the relations to fetch with the run
     * @param {boolean} [relations.tags] if true, related tags will be fetched alongside the run
     * @param {boolean} [relations.detectors] if true, related detectors will be fetched alongside the run
     * @param {boolean} [relations.runType] if true, related run type will be fetched alongside the run
     * @param {boolean} [relations.eorReasons] if true, related end of run reasons will be fetched alongside the run
     * @param {boolean} [relations.flpRoles] if true, related flpRoles will be fetched alongside the run
     * @return {Promise<Run|null>} resolve with the run found or null
     */
    async get(identifier, relations) {
        relations = relations || {};
        const run = await getRun(
            identifier,
            (queryBuilder) => {
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
            },
        );

        return run ? runAdapter.toEntity(run) : null;
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
        const { runTypeName = null } = relations || {};

        const detectors = newRun.detectors
            ? await getOrCreateAllDetectorsByName(newRun.detectors.split(',').map((value) => value.trim()))
            : null;

        if (runTypeName) {
            const runType = await getOrCreateRunType({ name: runTypeName });
            newRun.runTypeId = runType.id;
        }

        const runId = await createRun(runAdapter.toDatabase(newRun), detectors);

        return this.get({ runId }, { runType: true, detectors: true });
    }

    /**
     * Update the given run
     *
     * @param {RunIdentifier} identifier the identifier of the run to update
     * @param {Partial<Run>} runPatch the patch to apply on the run
     * @param {Object} [relations] updates to the run's relations
     * @param {string[]|null} [relations.tagsTexts] if not null, the list of tag texts representing tags to apply to the run (will
     *     replace existing ones)
     * @param {EorReason[]|null} [relations.eorReasons] if not null, the list of end of run reasons to apply to the run (will replace
     *     existing ones)
     * @param {string|null} [relations.runTypeName] if not null, the name of the updated run type
     * @param {UserIdentifier} [relations.userIdentifier] if not null, the identifier of the user requesting the run update
     * @param {{detectorId: number, quality: string}} [relations.detectorsQualities] an optional list representing the new quality of the run's
     *     detector (the run must be related to the given detector, the detectors not in this list keep their original quality)
     * @return {Promise<Run>} resolve with the resulting run
     */
    async update(identifier, runPatch, relations) {
        const { tagsTexts = null, eorReasons = null, runTypeName = null, userIdentifier = {}, detectorsQualities = [] } = relations || {};

        const tags = tagsTexts ? await getAllTagsByTextOrFail(tagsTexts, true) : null;

        if (runTypeName) {
            const runType = await getOrCreateRunType({ name: runTypeName });
            runPatch.runTypeId = runType.id;
        }

        let user = null;
        if (userIdentifier.userId !== undefined || userIdentifier.externalUserId !== undefined) {
            user = await getUserOrFail(userIdentifier);
        }

        await TransactionHelper.provide(async (transaction) => {
            const run = await updateRun(
                identifier,
                runAdapter.toDatabase(runPatch),
                tags ?? null,
                eorReasons?.map((eorReason) => eorReasonAdapter.toDatabase(eorReason)) ?? null,
                user,
                transaction,
            );

            // Update detector qualities if they are provided
            if (detectorsQualities.length > 0) {
                if (!(run.timeTrgEnd ?? run.timeO2End)) {
                    throw new BadParameterError('Detector quality can not be updated on a run that has not ended yet');
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

                await logQualityChange(run.runNumber, updatedRunDetectors, transaction, user);
            }
        });

        return this.get(identifier, { tags: true, runType: true, detectors: true, eorReasons: true });
    }
}

exports.RunService = RunService;

exports.runService = new RunService();
