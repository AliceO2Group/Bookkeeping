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
const GetTagUseCase = require('./GetTagUseCase');
const { BadParameterError } = require('../../server/errors/BadParameterError.js');
const { NotFoundError } = require('../../server/errors/NotFoundError.js');
const { getUserOrFail } = require('../../server/services/user/getUserOrFail.js');

/**
 * Update tag use case
 */
class UpdateTagUseCase {
    /**
     * Executes this use case
     *
     * @param {Object} dto The UpdateTagDto containing the values that needs to be updated.
     * @returns {Promise<Tag>} resolves with the updated tag
     * @throws {BadParameterError} if no user is provided in the session
     * @throws {NotFoundError} if the tag or the session user does not exist
     */
    async execute(dto) {
        const { body, params } = dto;
        const { tagId } = params;
        const { description, email, mattermost, archivedAt, color } = body;
        const userId = dto?.session?.id;
        if (userId === undefined || userId === null) {
            throw new BadParameterError('A user is required to update a tag');
        }

        await TransactionHelper.provide(async () => {
            const tag = await TagRepository.findOne(new QueryBuilder().where('id').is(tagId));
            if (!tag) {
                throw new NotFoundError(`Tag with this id (${tagId}) could not be found`);
            }

            const user = await getUserOrFail({ userId });

            tag.description = description;
            tag.email = email;
            tag.color = color;
            tag.mattermost = mattermost;
            tag.archivedAt = archivedAt;
            tag.lastEditedByUserId = user.id;
            await tag.save();
        });

        return new GetTagUseCase().execute({ params: { tagId } });
    }
}

module.exports = UpdateTagUseCase;
