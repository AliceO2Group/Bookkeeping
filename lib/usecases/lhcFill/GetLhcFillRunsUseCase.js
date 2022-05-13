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
        LhcFillAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        LhcFillRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * CreateLhcFillUseCase
 */
class GetLhcFillRunsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { lhcFillId } = params;
        const queryBuilder = new QueryBuilder();
        queryBuilder.where('id').is(lhcFillId);

        queryBuilder.include('runs');
        const lhcFill = await TransactionHelper.provide(() => LhcFillRepository.findOne(queryBuilder));
        console.log(lhcFill);
        return lhcFill ? LhcFillAdapter.toEntity(lhcFill).runs : null;
    }
}

module.exports = GetLhcFillRunsUseCase;
