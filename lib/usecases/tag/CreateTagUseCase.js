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
 * CreateTagUseCase
 */
class CreateTagUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateTagDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;

        const tag = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .where('text').is(body.text);
            const tag = await TagRepository.findOne(queryBuilder);
            if (tag) {
                return null;
            }

            return TagRepository.insert(TagAdapter.toDatabase(body));
        });

        return tag ? TagAdapter.toEntity(tag) : null;
    }
}

module.exports = CreateTagUseCase;
