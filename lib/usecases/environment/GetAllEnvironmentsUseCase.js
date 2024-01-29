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
const { statusAcronyms } = require('../../domain/enums/StatusAcronyms.js');
const { dataSource } = require('../../database/DataSource.js');

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
            } = filter;

            const filterQueryBuilder = prepareQueryBuilder();

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
                // Split the string into separate characters
                const historyItems = statusHistory.split('');

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

                // Filter the environments by status history using the subquery
                filterQueryBuilder.literalWhere(
                    `${ENVIRONMENT_STATUS_HISTORY_SUBQUERY} = :statusFilters`,
                    // Create a string of the status filters separated by a comma
                    { statusFilters: statusFilters.join(',') },
                );

                filterQueryBuilder.includeAttribute({
                    query: ENVIRONMENT_STATUS_HISTORY_SUBQUERY,
                    alias: 'statusHistory',
                });
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
