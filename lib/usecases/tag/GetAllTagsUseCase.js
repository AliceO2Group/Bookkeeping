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
        const { query = {} } = dto;
        const { page = {} } = query;
        const { limit = 100, offset = 0 } = page;

        const tags = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .limit(limit)
                .offset(offset);

            return TagRepository.findAll(queryBuilder);
        });

        return tags.map(TagAdapter.toEntity);
    }
}

module.exports = GetAllTagsUseCase;
