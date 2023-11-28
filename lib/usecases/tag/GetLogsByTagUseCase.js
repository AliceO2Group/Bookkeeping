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
const { ApiConfig } = require('../../config/index.js');

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
        const { query = {} } = dto;
        const { page = {} } = query;
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;


        return TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder().where('id').is(tagId);
            const tag = await TagRepository.findOne(queryBuilder);
            if (!tag) {
                return null;
            }

            const { logs, count } = await new GetAllLogsUseCase().execute(
                {
                    query: {
                        page: {
                            offset: offset,
                            limit: limit
                        },
                        filter: {
                            tags: {
                                values: [tag.text], operation: 'or'
                            }
                        }
                    }
                });

            const logsWithCount = await LogRepository.addChildrenCountByRootLog(logs);

            return { logs: logsWithCount, count };
        });
    }
}

module.exports = GetLogsByTagUseCase;
