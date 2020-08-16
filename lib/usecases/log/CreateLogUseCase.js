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
        LogAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        AttachmentRepository,
        LogRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');
const GetLogUseCase = require('./GetLogUseCase');

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
        const { parentLogId } = body;

        const log = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id;

            if (parentLogId) {
                const parentLog = await new GetLogUseCase().execute({ params: { logId: parentLogId } });
                if (!parentLog) {
                    return null;
                }

                body.rootLogId = parentLog.rootLogId || parentLog.id;
            }

            return LogRepository.insert(LogAdapter.toDatabase(body));
        });

        if (log && files && files.length > 0) {
            await TransactionHelper
                .provide(() => AttachmentRepository.bulkInsert(files.map((file) => ({ ...file, logId: log.id }))));
        }

        return log ? new GetLogUseCase().execute({ params: { logId: log.id } }) : null;
    }
}

module.exports = CreateLogUseCase;
