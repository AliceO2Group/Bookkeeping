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
        LhcFillRepository,
    },
    utilities: {
        TransactionHelper,
        QueryBuilder,
    },
} = require('../../database');
const GetLhcFillUseCase = require('./GetLhcFillUseCase');
const { lhcFillAdapter } = require('../../database/adapters/index.js');

/**
 * CreateLhcFillUseCase
 */
class CreateLhcFillUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;

        const lhcFill = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder();
            queryBuilder.where('fillNumber').is(body.fillNumber);
            const lhcFill = await LhcFillRepository.findOne(queryBuilder);
            if (lhcFill) {
                return {
                    error: {
                        status: '409',
                        source: { pointer: '/data/attributes/body/fillNumber' },
                        title: 'Conflict',
                        detail: 'The provided fillNumber already exists',
                    },
                };
            }
            return LhcFillRepository.insert(lhcFillAdapter.toDatabase(body));
        });
        if (lhcFill.error) {
            return lhcFill;
        }
        const result = await new GetLhcFillUseCase().execute({ params: { fillNumber: lhcFill.fillNumber } });
        return { result };
    }
}

module.exports = CreateLhcFillUseCase;
