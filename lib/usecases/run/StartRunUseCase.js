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
        TransactionHelper,
    },
} = require('../../database');

const {
    adapters: {
        RunAdapter,
    },
} = require('../../domain');

const GetRunUseCase = require('../run/GetRunUseCase');

/**
 * StartRunUseCase
 */
class StartRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The StartRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;
        const run = await TransactionHelper.provide(async () => {
            body.userId = dto.session.id || null;

            return RunRepository.insert(RunAdapter.toDatabase(body));
        });

        if (run.error) {
            return run;
        }

        const result = await new GetRunUseCase().execute({ params: { runId: run.id } });
        return { result };
    }
}

module.exports = StartRunUseCase;
