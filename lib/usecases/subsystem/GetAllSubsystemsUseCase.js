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
        SubsystemRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { ApiConfig } = require('../../config/index.js');
const { subsystemAdapter } = require('../../database/adapters/index.js');

/**
 * GetAllSubsystemsUseCase
 */
class GetAllSubsystemsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllSubsystems DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const { query = {} } = dto;
        const { page = {} } = query;
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;

        const { count, rows } = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .limit(limit)
                .offset(offset);

            return SubsystemRepository.findAndCountAll(queryBuilder);
        });

        return {
            count,
            subsystems: rows.map(subsystemAdapter.toEntity),
        };
    }
}

module.exports = GetAllSubsystemsUseCase;
