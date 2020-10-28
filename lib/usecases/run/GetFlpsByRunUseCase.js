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
    adapters: {
    },
} = require('../../domain');
const {
    repositories: {
        FlpRepository,
        RunRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetFlpsByRunUseCase
 */
class GetFlpsByRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const queryBuilder = new QueryBuilder();
        const { params } = dto;
        const { runId } = params;

        queryBuilder.where('id').is(runId);
        return await TransactionHelper.provide(async () => {
            const run = await RunRepository.findOne(queryBuilder);
            return run ? FlpRepository.findAllByRunId(run.id) : null;
        });
    }
}

module.exports = GetFlpsByRunUseCase;
