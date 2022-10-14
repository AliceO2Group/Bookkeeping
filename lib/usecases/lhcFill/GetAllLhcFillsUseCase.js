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
        LhcFillRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { physicsRunsIncludeExpression } = require('../../database/repositories/qbHelpers/lhcFill/physicsRunsIncludeExpression.js');
const { lhcFillAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');

/**
 * GetAllLhcFillsUseCase
 */
class GetAllLhcFillsUseCase {
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

        const { count, rows } = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder();
            queryBuilder.include(physicsRunsIncludeExpression);
            queryBuilder.orderBy('fillNumber', 'desc');
            queryBuilder.limit(limit);
            queryBuilder.offset(offset);
            return LhcFillRepository.findAndCountAll(queryBuilder);
        });

        // Manually remove runs if there is no stable beam, because they can not be excluded from the include directly
        for (const rowIndex in rows) {
            if (!rows[rowIndex].stableBeamsStart) {
                rows[rowIndex].runs = [];
            }
        }
        return {
            count,
            lhcFills: rows.map(lhcFillAdapter.toEntity),
        };
    }
}

module.exports = GetAllLhcFillsUseCase;
