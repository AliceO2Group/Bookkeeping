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
} = require('../../database');
const { environmentAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');
const { Op } = require('sequelize');
const { dataSource } = require('../../database/DataSource.js');
const { statusAcronyms } = require('../../domain/enums/StatusAcronyms.js');

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
 * Subquery to select the status history for each environment.
 * It orders the history items by updatedAt ASC to have the oldest
 * history item first. Then it concatenates all the statuses into a single string,
 * giving a history of status changes for each environment.
 *
 */
const ENVIRONMENT_STATUS_HISTORY_SUBQUERY = `
    (SELECT GROUP_CONCAT(h.status ORDER BY h.updated_at ASC)
        FROM environments_history_items AS h
        WHERE h.environment_id = Environment.id
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

        /**
         * Prepare a query builder with ordering, limit and offset
         *
         * @return {QueryBuilder} the created query builder
         */
        const prepareQueryBuilder = () => dataSource.createQueryBuilder()
            .orderBy('updatedAt', 'desc')
            .limit(limit)
            .offset(offset);

        const fetchQueryBuilder = prepareQueryBuilder();

        if (filter) {
            const {
                ids: idsExpression,
                currentStatus: currentStatusExpression,
                statusHistory,
                runNumbers: runNumbersExpression,
                created,
            } = filter;

            const filterQueryBuilder = prepareQueryBuilder();

            if (created) {
                const from = created.from !== undefined ? created.from : 0;
                const to = created.to !== undefined ? created.to : Date.now();
                filterQueryBuilder.where('createdAt').between(from, to);
            }

            if (idsExpression) {
                const filters = idsExpression.split(',').map((id) => id.trim());

                // Filter should be like with only one filter
                if (filters.length === 1) {
                    filterQueryBuilder.where('id').substring(filters[0]);
                }

                // Filters should be exact with more than one filter
                if (filters.length > 1) {
                    filterQueryBuilder.andWhere({ id: { [Op.in]: filters } });
                }
            }

            if (currentStatusExpression) {
                const filters = currentStatusExpression.split(',').map((status) => status.trim());

                // Filter the environments by current status using the subquery
                filterQueryBuilder.literalWhere(
                    `${ENVIRONMENT_LATEST_HISTORY_ITEM_SUBQUERY} IN (:filters)`,
                    { filters },
                );

                filterQueryBuilder.includeAttribute({
                    query: ENVIRONMENT_LATEST_HISTORY_ITEM_SUBQUERY,
                    alias: 'currentStatus',
                });
            }

            if (statusHistory) {
                // Check if status history ends with 'X' and remove it if present to handle the special case later
                const containsX = statusHistory.endsWith('X');
                const cleanedStatusHistory = containsX ? statusHistory.slice(0, -1) : statusHistory;
                const historyItems = cleanedStatusHistory.split('');

                // Swap the acronyms with the status (=acronym -> status)
                const acronymToStatus = {};
                for (const status in statusAcronyms) {
                    acronymToStatus[statusAcronyms[status]] = status;
                }

                // Create a list of status history with the status acronyms
                const statusFilters = [];
                for (const historyItem of historyItems) {
                    // Only add the next status if it is in the acronyms list
                    if (Object.values(statusAcronyms).includes(historyItem)) {
                        // Use the acronym to get the status
                        statusFilters.push(acronymToStatus[historyItem]);
                    }
                }

                if (containsX) {
                    const statusFiltersWithDestroyed = [...statusFilters, 'DESTROYED'].join(',');
                    const statusFiltersWithDone = [...statusFilters, 'DONE'].join(',');

                    /*
                     * Use OR condition to match subsequences ending with either DESTROYED or DONE
                     * Filter the environments by using LIKE for subsequence matching
                     */
                    filterQueryBuilder.literalWhere(
                        `(${ENVIRONMENT_STATUS_HISTORY_SUBQUERY} LIKE :statusFiltersWithDestroyed OR ` +
                        `${ENVIRONMENT_STATUS_HISTORY_SUBQUERY} LIKE :statusFiltersWithDone)`,
                        {
                            statusFiltersWithDestroyed: `%${statusFiltersWithDestroyed}`,
                            statusFiltersWithDone: `%${statusFiltersWithDone}`,
                        },
                    );

                    filterQueryBuilder.includeAttribute({
                        query: ENVIRONMENT_STATUS_HISTORY_SUBQUERY,
                        alias: 'statusHistory',
                    });
                } else {
                    filterQueryBuilder.literalWhere(
                        `${ENVIRONMENT_STATUS_HISTORY_SUBQUERY} LIKE :statusFilters`,
                        { statusFilters: `%${statusFilters.join(',')}%` },
                    );

                    filterQueryBuilder.includeAttribute({
                        query: ENVIRONMENT_STATUS_HISTORY_SUBQUERY,
                        alias: 'statusHistory',
                    });
                }
            }

            if (runNumbersExpression) {
                // Convert the string of run numbers to an array of numbers
                const filters = runNumbersExpression.split(',').map((filter) => Number(filter.trim()));

                if (filters.length) {
                    filterQueryBuilder.include({
                        association: 'runs',
                        where: {
                            // Filter should be like with only one filter and exact with more than one filter
                            runNumber: { [filters.length === 1 ? Op.substring : Op.in]: filters },
                        },
                    });
                }
            }

            const filteredEnvironmentsIds = (await EnvironmentRepository.findAll(filterQueryBuilder)).map(({ id }) => id);
            // If no environments match the filter, return an empty result
            if (filteredEnvironmentsIds.length === 0) {
                return {
                    count: 0,
                    environments: [],
                };
            }
            fetchQueryBuilder.where('id').oneOf(filteredEnvironmentsIds);
        }

        fetchQueryBuilder.include({ association: 'runs' });
        fetchQueryBuilder.include({ association: 'historyItems' });
        const { count, rows } = await EnvironmentRepository.findAndCountAll(fetchQueryBuilder);
        return {
            count,
            environments: rows.map((environment) => environmentAdapter.toEntity(environment)),
        };
    }
}

module.exports = GetAllEnvironmentsUseCase;
