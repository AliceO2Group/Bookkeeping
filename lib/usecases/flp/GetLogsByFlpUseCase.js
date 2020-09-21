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
        LogAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        LogRepository,
        RunRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetLogsByFlpUseCase
 */
class GetLogsByFlpUseCase {
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
        const logs = await TransactionHelper.provide(async () => {
            const run = await RunRepository.findOne(queryBuilder);
            return run ? LogRepository.findAllByRunId(run.id) : null;
        });

        if (logs) {
            const logsWithReplies = await LogRepository.addChildrenCountByRootLog(logs);
            return logsWithReplies.map(LogAdapter.toEntity);
        } else {
            return null;
        }
    }
}

module.exports = GetLogsByFlpUseCase;
