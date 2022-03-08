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

/**
 * Update tag use case
 */
class UpdateTagUseCase {
    /**
     * Executes this use case
     * @param {Object} dto The UpdateTagDto containing the values that needs to be updated.
     * @returns {Promise} Promise object that represents the result of the update.
     */
    async execute(dto) {
        const { body, params } = dto;
        const { tagId } = params;
        const { email, mattermost } = body;

        await TransactionHelper.provide(async () =>{
            const queryBuilder = new QueryBuilder.where('id').is(tagId);
            const tagObject = await TagRepository.findOne(queryBuilder);

            if (tagObject) {
                tagObject.email = email;
                tagObject.mattermost = mattermost;
                await tagObject.save();
                return tagObject;
            } else {
                return {
                    error: {
                        status: 400,
                        ttile: `this tag with this tag id: (${tagId}) could not be found `,
                    },
                };
            }
        });
    }
}

module.exports = UpdateTagUseCase;
