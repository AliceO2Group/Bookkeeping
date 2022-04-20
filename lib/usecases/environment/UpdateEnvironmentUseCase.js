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
        EnvironmentRepository,
    },
    utilities: {
        TransactionHelper,
        QueryBuilder,
    },
} = require('../../database');

const GetEnvironmentUseCase = require('./GetEnvironmentUseCase');
const { RunRepository } = require('../../database/repositories');

/**
 * UpdateEnvironmentUseCase
 */
class UpdateEnvironmentUseCase {
    /**
     * Executes this use case
     *
     * @param {Object} dto A dto containing the required data.
     * @returns {Promise} Promise object represents the result of this execution.
     */
    async execute(dto) {
        const { params, body } = dto;
        const { envId } = params;
        const { toredownAt, run, status, statusMessage } = body;

        const environment = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder().where('id').is(envId).include('runs');
            const env = await EnvironmentRepository.findOne(queryBuilder);
            if (!env) {
                return {
                    error: {
                        status: '400',
                        title: `Environment with this envId (${envId}) could not be found`,
                    },
                };
            }
            if (toredownAt) {
                env.toredownAt = toredownAt;
            }
            if (run) {
                const runObj = await RunRepository.findOne(new QueryBuilder().where('id').is(run));
                if (!runObj) {
                    return {
                        error: {
                            status: '400',
                            title: `Run with this id (${run}) could not be found`,
                        },
                    };
                }
                runObj.envId = envId;
                await runObj.save();
            }
            if (status) {
                env.status = status;
            }
            if (statusMessage) {
                env.statusMessage = statusMessage;
            }
            await env.save();
            return env;
        });
        if (environment.error) {
            return environment;
        }
        const result = await new GetEnvironmentUseCase().execute({ params: { envId: envId } });
        return { result };
    }
}

module.exports = UpdateEnvironmentUseCase;
