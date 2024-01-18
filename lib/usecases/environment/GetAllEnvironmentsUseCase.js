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
    },
} = require('../../database');
const { environmentAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');
const { Op } = require('sequelize');

/*
 * Const PDP_BEAM_TYPES_IN_STATISTICS_SUBQUERY = `
 *     (SELECT r.pdp_beam_type
 *         FROM runs AS r
 *         WHERE r.lhc_period_id = lhcPeriod.id
 *             AND r.definition = 'PHYSICS'
 *             AND r.run_quality = 'good'
 *             AND r.pdp_beam_type IS NOT NULL
 *         LIMIT 1
 *     )`;
 */
/**
 * Subquery to select the latest history item for each environment.
 * It orders the history items by updatedAt DESC and selects to have the latests
 * history item on top. Then it limits the result to 1, so only
 * the latest history item is selected.
 *
 * Environment refers to the current environment in the main query,
 * because this query is a sub query that is executed for every environment.
 */
const ENVIRONMENT_LATEST_HISTORY_ITEM_SUBQUERY = `
(SELECT h.status
    FROM environments_history_items AS h
    WHERE h.environment_id = Environment.id
    ORDER BY h.updated_at DESC
    LIMIT 1
)`;

/**
 * GetAllEnvironmentsUseCase
 */
class GetAllEnvironmentsUseCase {
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

        const queryBuilder = new QueryBuilder();

        if (filter) {
            const { ids, currentStatus } = filter;
            if (ids) {
                const filters = ids.split(',').map((id) => id.trim());

                // Filter should be like with only one filter
                if (filters.length === 1) {
                    queryBuilder.where('id').substring(filters[0]);
                }

                // Filters should be exact with more than one filter
                if (filters.length > 1) {
                    queryBuilder.andWhere({ id: { [Op.in]: filters } });
                }
            }

            if (currentStatus) {
                const filters = currentStatus.split(',').map((status) => status.trim());

                // Filter the environments by current status using the subquery
                queryBuilder.literalWhere(
                    `${ENVIRONMENT_LATEST_HISTORY_ITEM_SUBQUERY} IN (:filters)`,
                    { filters },
                );

                queryBuilder.includeAttribute({
                    query: ENVIRONMENT_LATEST_HISTORY_ITEM_SUBQUERY,
                    alias: 'currentStatus',
                });
            }
        }

        const { count, rows } = await TransactionHelper.provide(async () => {
            queryBuilder.orderBy('updatedAt', 'desc');
            queryBuilder.limit(limit);
            queryBuilder.offset(offset);
            queryBuilder.include({ association: 'runs', separate: true });
            queryBuilder.include({ association: 'historyItems', separate: true });

            return EnvironmentRepository.findAndCountAll(queryBuilder);
        });

        return {
            count,
            environments: rows.map((environment) => environmentAdapter.toEntity(environment)),
        };
    }
}

module.exports = GetAllEnvironmentsUseCase;
