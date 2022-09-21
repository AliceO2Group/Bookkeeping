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
    adapters: {
        RunTypeAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        RunTypeRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetRunTypeUseCase
 */
class GetRunTypeUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunTypeDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { runTypeId, name } = params;

        /*
         * Check if there is being searched on id or name
         * Build query builder
         */
        const queryBuilder = new QueryBuilder();
        name ?
            queryBuilder.where('name').is(name)
            : queryBuilder.where('id').is(runTypeId);
        // Get run type and return return the entity
        const runType = await TransactionHelper.provide(() => RunTypeRepository.findOne(queryBuilder));
        return runType ? RunTypeAdapter.toEntity(runType) : null;
    }
}

module.exports = GetRunTypeUseCase;
