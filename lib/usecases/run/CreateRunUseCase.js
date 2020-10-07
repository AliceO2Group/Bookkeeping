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
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');

const {
    adapters: {
        RunAdapter,
    },
} = require('../../domain');

/**
 * CreateRunUseCase
 */
class CreateRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;
        console.log(body);

        const log = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;


        
            return RunRepository.insert(LogAdapter.toDatabase(body));
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

module.exports = CreateRunUseCase;
