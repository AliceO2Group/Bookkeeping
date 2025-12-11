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
const { unpackNumberRange } = require('../../utilities/rangeUtils.js');
const { splitStringToStringsTrimmed } = require('../../utilities/stringUtils.js');

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

        let associatedStatisticsRequired = false;

        if (filter) {
            const { hasStableBeams, fillNumbers, beamDurationOperator, beamDuration, runDurationOperator, runDuration, beamsType } = filter;
            if (hasStableBeams) {
                // For now, if a stableBeamsStart is present, then a beam is stable
                queryBuilder.where('stableBeamsStart').not().is(null);
            }

            if (fillNumbers) {
                const fillNumberCriteria = splitStringToStringsTrimmed(fillNumbers, SEARCH_ITEMS_SEPARATOR);

                const finalFillnumberList = Array.from(unpackNumberRange(fillNumberCriteria));

                // Check that the final fill numbers list contains at least one valid fill number
                if (finalFillnumberList.length > 0) {
                    queryBuilder.where('fillNumber').oneOf(...finalFillnumberList);
                }
            }

            // Run duration filter and corresponding operator.
            if (runDuration !== null && runDuration !== undefined && runDurationOperator) {
                associatedStatisticsRequired = true;
                // 00:00:00 aka 0 value is saved in the DB as null
                runDuration === 0 ? queryBuilder.whereAssociation('statistics', 'runsCoverage').applyOperator(runDurationOperator, null)
                    : queryBuilder.whereAssociation('statistics', 'runsCoverage').applyOperator(runDurationOperator, runDuration);
            }

            // Beam duration filter and corresponding operator.
            if (beamDuration !== null && beamDuration !== undefined && beamDurationOperator) {
                beamDuration === 0 ? queryBuilder.where('stableBeamsDuration').applyOperator(beamDurationOperator, null)
                    : queryBuilder.where('stableBeamsDuration').applyOperator(beamDurationOperator, beamDuration);
            }

            // Beams type.
            if (beamsType) {
                const beamTypes = beamsType.split(',');
                queryBuilder.where('beamType').oneOf(beamTypes);
            }
        }

        const { count, rows } = await TransactionHelper.provide(async () => {
            queryBuilder.include({
                association: 'runs',
                where: { definition: RunDefinition.PHYSICS },
                required: false,
            });
            queryBuilder.include({
                association: 'statistics',
                required: associatedStatisticsRequired,
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
