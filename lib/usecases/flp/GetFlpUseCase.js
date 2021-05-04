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
        FlpAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        FlpRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetFlpUseCase
 */
class GetFlpUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetFlpDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { flpId } = params;

        const queryBuilder = new QueryBuilder()
            .include('runs')
            .where('id').is(flpId);

        const flp = await TransactionHelper.provide(() => FlpRepository.findOne(queryBuilder));
        return flp ? FlpAdapter.toEntity(flp) : null;
    }
}

module.exports = GetFlpUseCase;
