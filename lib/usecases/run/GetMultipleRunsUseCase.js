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
        QueryBuilder,
        TransactionHelper,
    },
    models: {
        EorReason,
        ReasonType,
    },
} = require('../../database');
const { runAdapter } = require('../../database/adapters/index.js');

/**
 * GetMultipleRunsUseCase
 */
class GetMultipleRunsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { runIds, runNumbers } = params;

        const queryBuilder = new QueryBuilder()
            .include('tags')
            .include('runType')
            .include('detectors')
            .include({
                model: EorReason,
                as: 'eorReasons',
                include: {
                    model: ReasonType,
                    as: 'reasonType',
                },
            })
            .include('lhcFill')
            .include('lhcPeriod');

        if (runNumbers) {
            queryBuilder.where('runNumber').oneOf(runNumbers);
        }
        if (runIds) {
            queryBuilder.where('id').oneOf(runIds);
        }

        const runs = await TransactionHelper.provide(() => RunRepository.findOne(queryBuilder));

        return runs ? runAdapter.toEntity(runs) : null;
    }
}

module.exports = GetMultipleRunsUseCase;
