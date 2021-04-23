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
const GetRunByRunNumberUseCase = require('../run/GetRunByRunNumberUseCase');

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
        const { runNumbers } = body;

        const flp = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;

            if (runNumbers) {
                const runIds = [];
                for (const runNumber of runNumbers) {
                    const run = await new GetRunByRunNumberUseCase()
                        .execute({ params: { runNumber } });
                    runIds.push(run.id);
                }

                body.runIds = runIds;
            }

            return FlpRepository.insert(FlpAdapter.toDatabase(body));
        });

        if (flp.error) {
            return flp;
        }

        const result = await new GetFlpUseCase().execute({ params: { flpId: flp.id } });
        return { result };
    }
}

module.exports = CreateFlpUseCase;
