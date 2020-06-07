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
        LogRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

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
        const { body } = dto;
        const { parentLogId } = body;

        return TransactionHelper.provide(async () => {
            if (parentLogId) {
                const queryBuilder = new QueryBuilder()
                    .where('id').is(parentLogId);

                const parentLog = await LogRepository.findOne(queryBuilder);
                if (!parentLog) {
                    return null;
                }

                body.rootLogId = parentLog.rootLogId;
            }

            return LogRepository.insert(body);
        });
    }
}

module.exports = CreateLogUseCase;
