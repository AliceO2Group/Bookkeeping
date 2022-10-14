/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    repositories: {
        RunTypeRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { ApiConfig } = require('../../config/index.js');
const { runTypeAdapter } = require('../../database/adapters/index.js');

/**
 * GetAllRunTypesUseCase
 */
class GetAllRunTypesUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllLogs DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const { query = {} } = dto;
        const { page = {} } = query;
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;

        const { count, rows } = await TransactionHelper.provide(async ()=> {
            const queryBuilder = new QueryBuilder();
            queryBuilder.orderBy('name', 'desc');
            queryBuilder.limit(limit);
            queryBuilder.offset(offset);
            return RunTypeRepository.findAndCountAll(queryBuilder);
        });
        return {
            count,
            runTypes: rows.map(runTypeAdapter.toEntity),
        };
    }
}

module.exports = GetAllRunTypesUseCase;
