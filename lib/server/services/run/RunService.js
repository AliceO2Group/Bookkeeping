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
const { getRunTypeOrFail } = require('../runType/getRunTypeOrFail.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');

/**
 * @typedef RunIdentifier object to uniquely identify a run
 * @property {number} [runNumber] the run number
 * @property {number} [runId] the id of the run, ignored if runNumber is present
 */

/**
 * Global service to handle runs instances
 */
class RunService {
    /**
     * Find and return a run by its run number or id
     *
     * @param {RunIdentifier} identifier the identifier of the run to find
     * @return {Promise<Run|null>} resolve with the run found or null
     */
    async get(identifier) {
        const run = await getRun(
            identifier,
            (queryBuilder) => queryBuilder
                .include('tags')
                .include({ association: 'eorReasons', include: { model: ReasonType, as: 'reasonType' } }),
        );

        return run ? runAdapter.toEntity(run) : null;
    }

    /**
     * Create a run in the database and return the created instance
     *
     * @param {Partial<Run>} newRun the run to create
     * @return {Promise<Run>} resolve with the created run instance
     */
    async create(newRun) {
        const runId = await createRun(runAdapter.toDatabase(newRun));
        return this.get({ runId });
    }

    /**
     * Update the given run
     *
     * @param {RunIdentifier} identifier the identifier of the run to update
     * @param {Partial<Run>} runPatch the patch to apply on the run
     * @param {Object} relations updates to the run's relations
     * @param {string[]|null} [relations.tagsTexts] if not null, the list of tag texts representing tags to apply to the run (will
     *     replace existing ones)
     * @param {EorReason[]|null} [relations.eorReasons] if not null, the list of end of run reasons to apply to the run (will replace
     *     existing ones)
     * @param {string|null} [relations.runTypeName] if not null, the name of the updated run type
     * @param {number} [relations.userId] if not null, the identifier of the user requesting the run update
     * @return {Promise<Run>} resolve with the resulting run
     */
    async update(identifier, runPatch, relations) {
        const { tagsTexts = null, eorReasons = null, runTypeName = null, userId } = relations || {};

        const tags = tagsTexts ? await getAllTagsByTextOrFail(tagsTexts) : null;

        if (runTypeName) {
            const runType = await getRunTypeOrFail({ name: runTypeName });
            runPatch.runTypeId = runType.id;
        }

        let user = null;
        if (userId !== undefined) {
            user = await getUserOrFail(userId);
        }

        await updateRun(
            identifier,
            runAdapter.toDatabase(runPatch),
            tags ?? null,
            eorReasons?.map((eorReason) => eorReasonAdapter.toDatabase(eorReason)) ?? null,
            user,
        );
        return this.get(identifier);
    }
}

exports.RunService = RunService;

exports.runService = new RunService();
