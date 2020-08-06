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
        LogRepository,
        TagRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

const { GetAllLogsUseCase } = require('../log');

/**
 * GetLogsByTagUseCase
 */
class GetLogsByTagUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetTagDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { tagId } = params;

        const logs = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .where('id').is(tagId);
            const tag = await TagRepository.findOne(queryBuilder);
            if (!tag) {
                return null;
            }

            const dto = { query: { filter: { tag: { values: [tagId], operation: 'or' } } } };
            const { logs } = await new GetAllLogsUseCase().execute(dto);
            const logsWithReplies = await LogRepository.addChildrenCountByRootLog(logs);

            return logsWithReplies;
        });

        return logs;
    }
}

module.exports = GetLogsByTagUseCase;
