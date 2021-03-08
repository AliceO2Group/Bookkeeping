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
        RunTagsRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');

const GetAllTagsUseCase = require('../tag/GetAllTagsUseCase');
const GetRunUseCase = require('./GetRunUseCase');

/**
 * UpdateRunTagsUseCase
 */
class UpdateRunTagsUseCase {
    /**
     * Executes this use case.
     *
     * @param {UpdateRunTagsDto} dto The UpdateRunTagsDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, params } = dto;
        const { tags } = body;
        const { runId } = params;

        const run = await TransactionHelper.provide(async () => {
            if (tags) {
                const existingTags = await new GetAllTagsUseCase()
                    .execute({ query: { page: { filter: { ids: tags } } } });
                const missingTags = tags.reduce((accumulator, tag) => {
                    if (!existingTags.tags.find(({ id }) => id === tag)) {
                        accumulator.push(tag);
                    }
                    return accumulator;
                }, []);

                if (missingTags.length > 0) {
                    return {
                        error: {
                            status: '400',
                            title: `Tags with these ids (${missingTags.join(', ')}) could not be found`,
                        },
                    };
                }
            }

            // Remove existing tags of the run and insert new ones
            return await RunTagsRepository.removeById(runId)
                .then(() => RunTagsRepository.updateMany(tags.map((tag) => ({
                    runId,
                    tagId: tag,
                }))));
        });

        if (run.error) {
            return run;
        }

        const result = await new GetRunUseCase().execute({ params: { runId } });
        return { result };
    }
}

module.exports = UpdateRunTagsUseCase;
