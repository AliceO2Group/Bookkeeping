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
        AttachmentRepository,
        LogRepository,
        LogTagsRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');

const {
    adapters: {
        LogAdapter,
    },
} = require('../../domain');

const GetLogUseCase = require('./GetLogUseCase');
const GetAllTagsUseCase = require('../tag/GetAllTagsUseCase');

/**
 * CreateLogUseCase
 */
class CreateLogUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateLogDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, files } = dto;
        const { parentLogId, tags } = body;

        const log = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id;

            if (parentLogId) {
                const parentLog = await new GetLogUseCase().execute({ params: { logId: parentLogId } });
                if (!parentLog) {
                    return {
                        error: {
                            status: '400',
                            title: `Parent log with this id (${parentLogId}) could not be found`,
                        },
                    };
                }

                body.rootLogId = parentLog.rootLogId || parentLog.id;
            }

            if (tags) {
                const existingTags = await new GetAllTagsUseCase()
                    .execute({ query: { page: { filter: { ids: tags } } } });
                const missingTags = tags.reduce((accumulator, tag) => {
                    if (!existingTags.find(({ id }) => id === tag)) {
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

            return LogRepository.insert(LogAdapter.toDatabase(body));
        });

        if (log.error) {
            return log;
        }

        if (!log.error && tags) {
            await TransactionHelper
                .provide(() => LogTagsRepository.bulkInsert(tags.map((tag) => ({ logId: log.id, tagId: tag }))));
        }

        if (!log.error && files && files.length > 0) {
            await TransactionHelper
                .provide(() => AttachmentRepository.bulkInsert(files.map((file) => ({ ...file, logId: log.id }))));
        }

        const result = await new GetLogUseCase().execute({ params: { logId: log.id } });
        return { result };
    }
}

module.exports = CreateLogUseCase;
