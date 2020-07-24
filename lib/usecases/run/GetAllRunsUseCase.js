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
        RunTagsRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { RunAdapter } = require('../../database/adapters');

/**
 * GetAllRunssUseCase
 */
class GetAllRunsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllRuns DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { filter, page = {}, sort = { id: 'desc' } } = query;

        if (filter) {
            const { origin, parentRun, rootRun } = filter;
            if (origin) {
                queryBuilder.where('origin').is(origin);
            }

            if (parentRun) {
                queryBuilder.where('parentRunId').is(parentRun);
            }

            if (rootRun) {
                queryBuilder.where('rootRunId').is(rootRun);
            }
        }

        const { limit = 100, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        queryBuilder.include('tags');

        const {
            count,
            rows,
        } = await await TransactionHelper.provide(async () => {
            if (filter && filter.tag) {
                const subQueryBuilder = new QueryBuilder();
                subQueryBuilder.where('tagId').oneOf(...filter.tag.values).orderBy('runId', 'asc');

                let runTags;
                switch (filter.tag.operation) {
                    case 'and':
                        runTags = await RunTagsRepository
                            .findAllAndGroup(subQueryBuilder);
                        runTags = runTags
                            .filter((runTag) => filter.tag.values.every((tagId) => runTag.tagIds.includes(tagId)));
                        break;
                    case 'or':
                        runTags = await RunTagsRepository
                            .findAll(subQueryBuilder);
                        break;
                }

                const runIds = runTags.map((runTag) => runTag.runId);
                queryBuilder.where('id').oneOf(...runIds);
            }

            return RunRepository.findAndCountAll(queryBuilder);
        });

        return {
            count,
            runs: rows.map(RunAdapter.toEntity),
        };
    }
}

module.exports = GetAllRunsUseCase;
