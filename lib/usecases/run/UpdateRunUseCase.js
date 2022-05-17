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
    },
    utilities: {
        TransactionHelper,
        QueryBuilder,
    },
} = require('../../database');
const GetRunUseCase = require('../run/GetRunUseCase');

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
        const { body, params } = dto;
        const { runId } = params;

        const { error } = await TransactionHelper.provide(async () => this._updateRun(runId, body));
        if (error) {
            return {
                error: {
                    status: '400',
                    title: error.message || `Unable to update run with id ${runId}`,
                },
            };
        }
        const result = await new GetRunUseCase().execute({ params: { runId } });
        return { result };
    }

    /**
     * Method that given a set of KV pairs containing run related fields, will update the run accordingly
     * @param {Number} runId - id of the run that needs to be updated;
     * @param {JSON} runUpdates - KV pairs with fields from a run that should be updated and their new values;
     * @returns {Promise<Run,Error>} Promise which shall resolve with updated RunObject or reject with specific error
     */
    async _updateRun(runId, runUpdates) {
        try {
            const { runQuality, envId, eorReasons } = runUpdates;

            const queryBuilder = new QueryBuilder().where('id').is(runId);
            const runObject = await RunRepository.findOne(queryBuilder);

            if (!runObject) {
                throw new Error(`run with this runId (${runId}) could not be found`);
            } else {
                if (runQuality) {
                    runObject.runQuality = runQuality;
                }
                if (envId) {
                    runObject.envId = envId;
                }
                if (eorReasons) {
                    await this._updateEorReasonsOnRun(runId, eorReasons);
                }
                await runObject.save();
                return runObject;
            }
        } catch (error) {
            return {
                error: {
                    message: error.message || `unable to save updates on run with id: ${runId}`,
                },
            };
        }
    }

    /**
     * Method to remove existing reason_type - run_id from `eor_reasons` table and insert new ones
     * @param {Number} runId - id of the run that is due to be modified
     * @param {Array<EorReason>} eorReasons - list of eor_reasons to be updated on the RUN
     * @returns {Run} - new run objects to be stored in the database
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

        await EorReasonRepository.removeById(runId);
        await EorReasonRepository.addMany(eorReasons);
    }
}

module.exports = UpdateRunUseCase;
