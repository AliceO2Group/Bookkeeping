/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
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
 * GetLhcFillUseCase
 */
class GetLhcFillUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { fillNumber } = params;

        const queryBuilder = new QueryBuilder()
            .include('runs')
            .where('fillNumber').is(fillNumber);

        const lhcFill = await TransactionHelper.provide(() => LhcFillRepository.findOne(queryBuilder));
        return lhcFill ? LhcFillAdapter.toEntity(lhcFill) : null;
    }
}

module.exports = GetLhcFillUseCase;
