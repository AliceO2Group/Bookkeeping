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
const { logAdapter } = require('../../database/adapters/index.js');

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
            .include('user')
            .include('tags')
            .include({ association: 'runs', attributes: ['id', 'runNumber'] })
            .include({ association: 'lhcFills', attributes: ['fillNumber'] })
            .include('attachments')
            .include({ association: 'environments', attributes: ['id'] })
            .where('id').is(logId);

        const log = await TransactionHelper.provide(() => LogRepository.findOne(queryBuilder));
        return log ? logAdapter.toEntity(log) : null;
    }
}

module.exports = GetLogUseCase;
