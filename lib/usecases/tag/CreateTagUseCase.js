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
        TagRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { tagAdapter } = require('../../database/adapters/index.js');
const { BadParameterError } = require('../../server/errors/BadParameterError.js');
const { ConflictError } = require('../../server/errors/ConflictError.js');
const { getUserOrFail } = require('../../server/services/user/getUserOrFail.js');

/**
 * CreateTagUseCase
 */
class CreateTagUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateTagDto containing all data.
     * @returns {Promise<Tag>} resolves with the created tag
     * @throws {BadParameterError} if no user is provided in the session
     * @throws {NotFoundError} if the session user does not exist
     * @throws {ConflictError} if a tag with the same text already exists
     */
    async execute(dto) {
        const { body } = dto;
        const userId = dto?.session?.id;
        if (userId === undefined || userId === null) {
            throw new BadParameterError('A user is required to create a tag');
        }

        const tag = await TransactionHelper.provide(async () => {
            const user = await getUserOrFail({ userId });
            body.lastEditedByUserId = user.id;

            const existingTag = await TagRepository.findOne(new QueryBuilder().where('text').is(body.text));
            if (existingTag) {
                throw new ConflictError('The provided entity already exists');
            }

            return TagRepository.insert(tagAdapter.toDatabase(body));
        });

        return tagAdapter.toEntity(tag);
    }
}

module.exports = CreateTagUseCase;
