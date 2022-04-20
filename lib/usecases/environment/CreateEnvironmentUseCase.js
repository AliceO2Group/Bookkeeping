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

const {
    adapters: {
        EnvironmentAdapter,
    } } = require('../../domain');
const GetEnvironmentUseCase = require('./GetEnvironmentUseCase');

/**
 * CreateEnvironmentUseCase
 */
class CreateEnvironmentUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateLogDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;
        const environment = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder();
            queryBuilder.where('id').is(body.envId);
            const environment = await EnvironmentRepository.findOne(queryBuilder);
            if (environment) {
                return { error: {
                    status: '409',
                    source: { pointer: '/data/attributes/body/envId' },
                    title: 'Conflict',
                    detail: 'The provided entity already exists',
                } };
            }
            return EnvironmentRepository.insert(EnvironmentAdapter.toDatabase(body));
        });
        if (environment.error) {
            return environment;
        }
        const result = await new GetEnvironmentUseCase().execute({ params: { envId: body.envId } });
        return { result } ;
    }
}

module.exports = CreateEnvironmentUseCase;
