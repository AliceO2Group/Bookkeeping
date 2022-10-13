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
        QueryBuilder,
        TransactionHelper,
    } } = require('../../database');
const { environmentAdapter } = require('../../database/adapters/index.js');

/**
 * GetEvironmentUseCase
 */
class GetEnvironmentUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetLogDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { envId } = params;
        const queryBuilder = new QueryBuilder();
        queryBuilder.where('id').is(envId);
        queryBuilder.include('runs');
        const env = await TransactionHelper.provide(() => EnvironmentRepository.findOne(queryBuilder));
        return env ? environmentAdapter.toEntity(env) : null;
    }
}

module.exports = GetEnvironmentUseCase;
