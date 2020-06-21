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
        LogRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetLogUseCase
 */
class GetLogUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetLogDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { logId } = params;

        const queryBuilder = new QueryBuilder()
            .include('tags')
            .include('user')
            .where('id').is(logId);

        const log = await TransactionHelper.provide(() => LogRepository.findOne(queryBuilder));
        return log ? LogAdapter.toEntity(log) : null;
    }
}

module.exports = GetLogUseCase;
