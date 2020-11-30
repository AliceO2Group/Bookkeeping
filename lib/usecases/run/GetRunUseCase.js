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
        RunAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        RunRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetRunUseCase
 */
class GetRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { runId } = params;

        const queryBuilder = new QueryBuilder()
            .include('tags')
            .where('id').is(runId);

        const run = await TransactionHelper.provide(() => RunRepository.findOne(queryBuilder));

        return run ? RunAdapter.toEntity(run) : null;
    }
}

module.exports = GetRunUseCase;
