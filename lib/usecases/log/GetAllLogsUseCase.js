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
        LogTagRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetAllLogsUseCase
 */
class GetAllLogsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllLogs DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { filter, page = {}, sort = { id: 'desc' } } = query;

        if (filter) {
            const { origin, parentLog, rootLog, tag } = filter;
            if (origin) {
                queryBuilder.where('origin').is(origin);
            }

            if (parentLog) {
                queryBuilder.where('parentLogId').is(parentLog);
            }

            if (rootLog) {
                queryBuilder.where('rootLogId').is(rootLog);
            }

            if (tag) {
                const subQueryBuilder = new QueryBuilder();
                subQueryBuilder.where('tagId').oneOf(...tag.values);
                subQueryBuilder.orderBy('logId', 'asc');
                let logTags;

                switch (tag.operation) {
                    case 'and':
                        logTags = await await TransactionHelper
                            .provide(() => LogTagRepository.findAllAndGroup(subQueryBuilder));
                        logTags = logTags
                            .filter((logTag) => tag.values.every((tagId) => logTag.tagIds.includes(tagId)));
                        break;
                    case 'or':
                        logTags = await await TransactionHelper
                            .provide(() => LogTagRepository.findAll(subQueryBuilder));
                        break;
                }

                const logIds = logTags.map((logTag) => logTag.logId);
                queryBuilder.where('id').oneOf(...logIds);
            }
        }

        const { limit = 100, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        queryBuilder.include('tags');

        const {
            count,
            entities,
        } = await await TransactionHelper.provide(() => LogRepository.findAndCountAll(queryBuilder));

        return {
            count,
            logs: entities,
        };
    }
}

module.exports = GetAllLogsUseCase;
