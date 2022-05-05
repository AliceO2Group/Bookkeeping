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
        const { runQuality, envId } = body;

        await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder().where('id').is(runId);
            const runObject = await RunRepository.findOne(queryBuilder);

            if (runObject) {
                if (runQuality) {
                    runObject.runQuality = runQuality;
                }
                if (envId) {
                    runObject.envId = envId;
                }
                await runObject.save();
                return runObject;
            } else {
                return {
                    error: {
                        status: '400',
                        title: `run with this runId (${runId}) could not be found`,
                    },
                };
            }
        });
        const result = await new GetRunUseCase().execute({ params: { runId } });
        return { result };
    }
}

module.exports = UpdateRunUseCase;
