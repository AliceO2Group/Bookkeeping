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
    repositories: {
        LhcFillRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { physicsRunsIncludeExpression } = require('../../database/repositories/qbHelpers/lhcFill/physicsRunsIncludeExpression.js');
const { lhcFillAdapter } = require('../../database/adapters/index.js');

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
            .include({
                ...physicsRunsIncludeExpression,
                include: ['tags', 'lhcFill', 'detectors'],
            })
            .where('fillNumber').is(fillNumber);

        /** @type {SequelizeLhcFill} lhcFill */
        const lhcFill = await TransactionHelper.provide(() => LhcFillRepository.findOne(queryBuilder));
        // Manually remove runs if there is no stable beam, because they can not be excluded from the include directly
        if (lhcFill) {
            if (!lhcFill.stableBeamsStart) {
                lhcFill.runs = [];
            } else {
                // Check that runs overlap with stable beam
                const stableBeamStartTime = new Date(lhcFill.stableBeamsStart).getTime();
                const stableBeamEndTime = (lhcFill.stableBeamsEnd ? new Date(lhcFill.stableBeamsEnd) : new Date()).getTime();

                lhcFill.runs = lhcFill.runs.filter(({
                    startTime,
                    endTime,
                }) => startTime && stableBeamEndTime >= startTime && endTime >= stableBeamStartTime);
            }
        }
        return lhcFill ? lhcFillAdapter.toEntity(lhcFill) : null;
    }
}

module.exports = GetLhcFillUseCase;
