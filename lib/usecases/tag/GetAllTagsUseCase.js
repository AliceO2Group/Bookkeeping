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
        TagAdapter,
    },
} = require('../../domain');

const {
    repositories: {
        TagRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetAllTagsUseCase
 */
class GetAllTagsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllLogs DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { filter = {}, page = {} } = query;
        const { limit = 100, offset = 0 } = page;

        queryBuilder.limit(limit);
        queryBuilder.offset(offset);
        queryBuilder.orderBy('text', 'asc');

        const {
            count,
            rows,
        } = await TransactionHelper.provide(async () => {
            if (filter) {
                const { ids, texts, emails, mattermosts } = filter;
                if (ids) {
                    const idList = ids.split(',').filter((id) => id !== '');
                    queryBuilder.where('id').oneOf(...idList);
                }
                if (texts) {
                    const textList = texts.split(',').filter((text) => text !== '');
                    queryBuilder.where('text').oneOf(...textList);
                }
                if (emails) {
                    const emailList = emails.split(',').filter((email) => email !== '');
                    queryBuilder.where('email').oneOf(...emailList);
                }
                if (mattermosts) {
                    const mattermostList = mattermosts.split(',').filter((mattermost) => mattermost !== '');
                    queryBuilder.where('mattermost').oneOf(...mattermostList);
                }
            }

            return TagRepository.findAndCountAll(queryBuilder);
        });

        return {
            count,
            tags: rows.map(TagAdapter.toEntity),
        };
    }
}

module.exports = GetAllTagsUseCase;
