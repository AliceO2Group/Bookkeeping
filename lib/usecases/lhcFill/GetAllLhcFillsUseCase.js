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
const { lhcFillAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');
const { RunDefinition } = require('../../domain/enums/RunDefinition.js');

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
        const { filter, page = {} } = query;
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;

        const SEARCH_ITEMS_SEPARATOR = ',';

        const queryBuilder = new QueryBuilder();

        if (filter) {
            const { hasStableBeams, fillNumbers } = filter;
            if (hasStableBeams) {
                // For now, if a stableBeamsStart is present, then a beam is stable
                queryBuilder.where('stableBeamsStart').not().is(null);
            }

            if (fillNumbers) {
                /*
                 * Split by SEARCH_ITEMS_SEPARATOR. Don't validate for only numbers
                 * Boolean trick: https://michaeluloth.com/javascript-filter-boolean/
                 */
                const fillNumberCriteria = fillNumbers.split(SEARCH_ITEMS_SEPARATOR)
                    .map((runNumbers) => runNumbers.trim())
                    .filter(Boolean);

                // Set to prevent duplicate values.
                const fillNumberSet = new Set();

                fillNumberCriteria.forEach((fillNumber) => {
                    if (fillNumber.includes('-')) {
                        const [start, end] = fillNumber.split('-').map((n) => parseInt(n, 10));
                        if (!Number.isNaN(start) && !Number.isNaN(end)) {
                            for (let i = start; i <= end; i++) {
                                fillNumberSet.add(i);
                            }
                        }
                    } else {
                        if (!Number.isNaN(fillNumber)) {
                            fillNumberSet.add(Number(fillNumber));
                        }
                    }
                });

                const finalFillnumberList = Array.from(fillNumberSet);

                // Check that the final fill numbers list contains at least one valid fill number
                if (finalFillnumberList.length > 0) {
                    queryBuilder.where('fillNumber').oneOf(...finalFillnumberList);
                }
            }
        }

        const { count, rows } = await TransactionHelper.provide(async () => {
            queryBuilder.include({
                association: 'runs',
                where: { definition: RunDefinition.PHYSICS },
                required: false,
            });
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
