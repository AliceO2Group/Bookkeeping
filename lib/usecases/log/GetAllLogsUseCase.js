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
        UserRepository,
        LogTagsRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { LogAdapter } = require('../../database/adapters');

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
            const { title, author, created, origin, parentLog, rootLog } = filter;

            if (title) {
                queryBuilder.where('title').substring(title);
            }

            if (author) {
                const userQueryBuilder = new QueryBuilder();
                userQueryBuilder.where('name').substring(author);
                const userResults = await UserRepository.findAll(userQueryBuilder);
                const userIds = userResults.length > 0 ? userResults.map((user) => user.id) : [0];
                queryBuilder.where('userId').oneOf(...userIds);
            }

            if (created) {
                const from = created.from !== undefined ? created.from : 0;
                const to = created.to !== undefined ? created.to : new Date().getTime();
                queryBuilder.where('createdAt').between(from, to);
            }

            if (origin) {
                queryBuilder.where('origin').is(origin);
            }

            if (parentLog) {
                queryBuilder.where('parentLogId').is(parentLog);
            }

            if (rootLog) {
                queryBuilder.where('rootLogId').is(rootLog);
            }
        }

        const { limit = 100, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        queryBuilder.include('user');
        queryBuilder.include('tags');
        queryBuilder.include('runs');
        queryBuilder.include('subsystems');

        const {
            count,
            rows,
        } = await await TransactionHelper.provide(async () => {
            if (filter && filter.tag) {
                const tagQueryBuilder = new QueryBuilder();
                tagQueryBuilder.where('tagId').oneOf(...filter.tag.values).orderBy('logId', 'asc');

                let logTags;
                switch (filter.tag.operation) {
                    case 'and':
                        logTags = await LogTagsRepository
                            .findAllAndGroup(tagQueryBuilder);
                        logTags = logTags
                            .filter((logTag) => filter.tag.values.every((tagId) => logTag.tagIds.includes(tagId)));
                        break;
                    case 'or':
                        logTags = await LogTagsRepository
                            .findAll(tagQueryBuilder);
                        break;
                }

                const logIds = logTags.map((logTag) => logTag.logId);
                queryBuilder.where('id').oneOf(...logIds);
            }

            return LogRepository.findAndCountAll(queryBuilder);
        });

        const rowsWithReplies = await LogRepository.addChildrenCountByRootLog(rows);

        return {
            count,
            logs: rowsWithReplies.map(LogAdapter.toEntity),
        };
    }
}

module.exports = GetAllLogsUseCase;
