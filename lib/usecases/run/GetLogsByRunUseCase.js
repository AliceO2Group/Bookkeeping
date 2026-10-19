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
} = require('../../database');
const { logService } = require('../../server/services/log/LogService.js');

/**
 * GetLogsByRunUseCase
 */
class GetLogsByRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise<Log[]|null>} Promise object represents the logs of the run, or null if the run does not exist.
     */
    async execute(dto) {
        const queryBuilder = new QueryBuilder();
        const { params: { runNumber } } = dto;

        queryBuilder.where('runNumber').is(runNumber);

        return TransactionHelper.provide(async () => {
            const run = await RunRepository.findOne(queryBuilder);
            return run ? logService.getAllByRun(run.id) : null;
        });
    }
}

module.exports = GetLogsByRunUseCase;
