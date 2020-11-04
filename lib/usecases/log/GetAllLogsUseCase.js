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
        LogRunsRepository,
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
        const { filter, sort = { id: 'desc' }, page = {} } = query;

        queryBuilder.include('user');
        queryBuilder.include('tags');
        queryBuilder.include('runs');
        queryBuilder.include('subsystems');
        queryBuilder.include('attachments');

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

        if (sort) {
            const { id, title, author, createdAt, tags, runs } = sort;

            if (id) {
                queryBuilder.orderBy('id', sort.id);
            }

            if (title) {
                queryBuilder.orderBy('title', sort.title);
            }

            if (author) {
                queryBuilder.orderBy('name', sort.author, 'user');
            }

            if (createdAt) {
                queryBuilder.orderBy('createdAt', sort.createdAt);
            }

            if (tags) {
                queryBuilder.orderBy('text', sort.tags, 'tags');
            }

            if (runs) {
                queryBuilder.orderBy('id', sort.runs, 'runs');
            }
        }

        const { limit = 100, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        const {
            count,
            rows,
        } = await TransactionHelper.provide(async () => {
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

            if (filter && filter.run) {
                const runQueryBuilder = new QueryBuilder();
                runQueryBuilder.where('runId').oneOf(...filter.run.values).orderBy('logId', 'asc');

                let logRuns;
                switch (filter.run.operation) {
                    case 'and':
                        logRuns = await LogRunsRepository
                            .findAllAndGroup(runQueryBuilder);
                        logRuns = logRuns
                            .filter((logRun) => filter.run.values.every((runId) => logRun.runIds.includes(runId)));
                        break;
                    case 'or':
                        logRuns = await LogRunsRepository
                            .findAll(runQueryBuilder);
                        break;
                }

                const logIds = logRuns.map((logRun) => logRun.logId);
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
