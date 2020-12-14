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
        FlpRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');

const {
    adapters: {
        FlpAdapter,
    },
} = require('../../domain');

const GetFlpUseCase = require('./GetFlpUseCase');

/**
 * CreateFlpUseCase
 */
class CreateFlpUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateFlpDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;
        const { runNumber } = body;

        const flp = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;

            if (runNumber) {
                /*
                 * TODO: Handle runNumber
                 * console.warn('CreateFlpUseCase does not yet handle dto.body.runNumber');
                 */
            }

            return FlpRepository.insert(FlpAdapter.toDatabase(body));
        });

        if (flp.error) {
            return flp;
        }

        if (!flp.error && runNumber) {
            /*
             * TODO: Handle runNumber
             * console.warn('CreateFlpUseCase does not yet handle dto.body.runNumber');
             */
        }

        const result = await new GetFlpUseCase().execute({ params: { flpId: flp.id } });
        return { result };
    }
}

module.exports = CreateFlpUseCase;
