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
        QueryBuilder,
    },
} = require('../../database');

const GetRunUseCase = require('../run/GetRunUseCase');
const { runService } = require('../../server/services/run/RunService.js');

/**
 * StartRunUseCase
 */
class StartRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {StartRunDto} dto The StartRunDto containing all data.
     * @returns {Promise<{result: (Run|undefined), error: (Object|undefined)}>} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;

        let error;
        let run;
        try {
            if (Array.isArray(body.detectors)) {
                body.detectors = body.detectors.join(',');
            }

            ({ run, error } = await TransactionHelper.provide(async () => this._createRun(body)));
        } catch {
            // Will use the default error
            error = {};
        }

        if (error) {
            return {
                error: {
                    status: error.status || 400,
                    title: 'Conflict',
                    detail: error.message || 'Unable to store the given run',
                },
            };
        }
        const result = await new GetRunUseCase().execute({ params: { runId: run.id } });
        return { result };
    }

    /**
     * Save a run in the database if it does not already exist
     *
     * @param {Run} run the run to save in the database
     * @return {Promise<{run, error}>} the inserted run model or the error that happen
     * @private
     */
    async _createRun(run) {
        const { runNumber } = run;

        const queryBuilder = new QueryBuilder().where('runNumber').is(runNumber);

        const existingRun = await TransactionHelper.provide(async () => RunRepository.findOne(queryBuilder));
        if (existingRun) {
            return {
                error: {
                    status: 409,
                    message: `A run already exists with run number ${runNumber}`,
                },
            };
        }

        const runTypeName = run.runType;
        delete run.runType;

        run = await runService.create(run, { runTypeName });
        return { run };
    }
}

module.exports = StartRunUseCase;
