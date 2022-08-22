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
        RunRepository,
        EorReasonRepository,
        ReasonTypeRepository,
        RunTagsRepository,
    },
    utilities: { TransactionHelper },
} = require('../../database');
const GetRunUseCase = require('./GetRunUseCase');
const { getAllTagsByTextOrFail } = require('../tag/getAllTagsByTextOrFail.js');
const { CreateLogUseCase } = require('../log/index.js');
const { getRunOrFail } = require('./getRunOrFail.js');
const { checkLhcFill } = require('../lhcFill/checkLhcFill.js');

/**
 * Update a run with provided values. For now we update only RunQuality
 */
class UpdateRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {UpdateRunDto} dto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, params, query } = dto;
        const runId = params ? params.runId : null;
        const runNumber = query ? query.runNumber : null;

        try {
            const { id } = await this._updateRun(runId, runNumber, body);
            const result = await new GetRunUseCase().execute({ params: { runId: id } });
            return { result };
        } catch (error) {
            return {
                error: {
                    status: 500,
                    title: 'ServiceUnavailable',
                    detail: error.message || `Unable to update run with id ${runId ? runId : runNumber}`,
                },
            };
        }
    }

    /**
     * Method that given a set of KV pairs containing run related fields, will update the run accordingly
     * @param {Number} runId - id of the run that needs to be updated;
     * @param {Number} runNumber - run number query parameter;
     * @param {JSON} runUpdates - KV pairs with fields from a run that should be updated and their new values;
     * @returns {Promise<Object|Error>} Promise which shall resolve with updated RunObject or reject with specific error
     */
    async _updateRun(runId, runNumber, runUpdates) {
        return TransactionHelper.provide(async (transaction) => {
            const {
                eorReasons,
                fillNumber,
                tags: tagsTexts,
            } = runUpdates;

            const run = await getRunOrFail({ runId, runNumber });
            await checkLhcFill(fillNumber, true);

            // Store the run quality to create a log if it changed
            const previousRun = { runQuality: run?.runQuality };

            await RunRepository.update(run, runUpdates, transaction);

            if (eorReasons) {
                await this._updateEorReasonsOnRun(runId, eorReasons);
            }

            if (tagsTexts) {
                const tags = await getAllTagsByTextOrFail(tagsTexts);

                // Remove existing tags of the run and insert new ones
                await RunTagsRepository.removeById(runId).then(() => RunTagsRepository.insertMany(tags.map((tag) => ({
                    runId,
                    tagId: tag.id,
                }))));
            }

            // Send notification if run quality has changed
            if (previousRun.runQuality !== run.runQuality) {
                await this._logQualityChange(run.runNumber, previousRun.runQuality, run.runQuality, transaction);
            }

            return run;
        });
    }

    /**
     * Method to remove existing reason_type - run_id from `eor_reasons` table and insert new ones
     * @param {Number} runId - id of the run that is due to be modified
     * @param {Array<EorReason>} eorReasons - list of eor_reasons to be updated on the RUN
     * @returns {Promise<undefined|Error>} - promise on result of db queries
     */
    async _updateEorReasonsOnRun(runId, eorReasons) {
        let reasonTypes = await ReasonTypeRepository.findAll();
        reasonTypes = reasonTypes.map((reason) => reason.id);
        const allReceivedReasonsExists = eorReasons.every((eorReason) => reasonTypes.includes(eorReason.reasonTypeId));
        const allReasonsMatchRunId = eorReasons.every((eorReason) => eorReason.runId === runId);
        if (!allReceivedReasonsExists) {
            throw new Error('Provided reason types do not exist');
        } else if (!allReasonsMatchRunId) {
            throw new Error('Multiple run ids parameters passed in eorReasons list. Please send updates for one run only');
        }

        const toKeepEorReasons = []; // EorReasons with an ID already, means exist in DB;
        const newEorReasons = []; // EorReasons with no ID, need to be added in DB;
        eorReasons.forEach((eorReason) => {
            if (eorReason.id) {
                toKeepEorReasons.push(eorReason.id);
            } else {
                newEorReasons.push(eorReason);
            }
        });
        await EorReasonRepository.removeByRunIdAndKeepIds(runId, toKeepEorReasons);
        await EorReasonRepository.addMany(newEorReasons);
    }

    /**
     * Create a log stating the run quality change
     *
     * @param {number} runNumber the run number of the run
     * @param {string} previousQuality the quality before update
     * @param {string} newQuality the quality after update
     * @param {Object} transaction the current transaction
     * @return {Promise<void>} resolve when log has been created
     * @private
     */
    async _logQualityChange(runNumber, previousQuality, newQuality, transaction) {
        const { error } = await new CreateLogUseCase().execute({
            body: {
                title: `Run ${runNumber} quality has changed to ${newQuality}`,
                text: `The run quality for run ${runNumber} has been changed from ${previousQuality} to ${newQuality}`,
                runNumbers: `${runNumber}`,
                tags: ['PDP', 'RC'],
            },
        }, transaction);
        if (error) {
            // TODO log the failed log creation
        }
    }
}

module.exports = UpdateRunUseCase;
