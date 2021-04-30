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
const FlpRunNumberRepository = require('../../database/repositories/FlpRunNumberRepository');
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
        const { runNumber } = body;

        const flp = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;

            if (runNumber) {
                /**
                 * Check if, for each runNumber, there is a run present in the DB with that runNumber
                 * Add the run's id to runIds if there is.
                 */
                 const runIds = [];
                     const run = await new GetRunByRunNumberUseCase()
                         .execute({ params: { runNumber } });
 
                     if (!run) {
                         return {
                             error: {
                                 status: '400',
                                 title: `Run with run number '${runNumber}' could not be found`,
                             },
                         };
                     }
                     runIds.push(run.id);
                 body.runIds = runIds;
            }

            return FlpRepository.insert(FlpAdapter.toDatabase(body));
        });

        if (flp.error) {
            return flp;
        }

        if (!flp.error && runNumber) {
            await TransactionHelper
            .provide(() => FlpRunNumberRepository
                .bulkInsert(body.runIds.map((runId) => ({ runId, flpRoleId: flp.id }))));
        }

        const result = await new GetFlpUseCase().execute({ params: { flpRoleId: flp.id } });
        return { result };
    }
}

module.exports = CreateFlpUseCase;
