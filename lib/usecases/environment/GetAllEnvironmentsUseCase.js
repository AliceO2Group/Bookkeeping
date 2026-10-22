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
const { unpackNumberRange } = require('../../utilities/rangeUtils.js');
const { splitStringToStringsTrimmed } = require('../../utilities/stringUtils.js');
const { setTimeRangeQuery } = require('../../utilities/setTimeRangeQuery.js');

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

        const queryBuilder = dataSource.createQueryBuilder()
            .orderBy('updatedAt', 'desc')
            .limit(limit)
            .offset(offset);

        if (filter) {
            const {
                ids: idsExpression,
                currentStatus: currentStatusExpression,
                statusHistory,
                runNumbers: runNumbersExpression,
                created,
            } = filter;

            if (created) {
                setTimeRangeQuery(created, 'createdAt', queryBuilder);
            }

            if (idsExpression) {
                const filters = idsExpression.split(',').map((id) => id.trim());

                // Filter should be like with only one filter
                if (filters.length === 1) {
                    queryBuilder.where('id').substring(filters[0]);
                }

                // Filters should be exact with more than one filter
                if (filters.length > 1) {
                    queryBuilder.andWhere({ id: { [Op.in]: filters } });
                }
            }

            if (currentStatusExpression) {
                const filters = currentStatusExpression.split(',').map((status) => status.trim());

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

            if (statusHistory) {
                // A status history ending with 'X' (done) must match the end of the environment's history
                const endsWithDone = statusHistory.endsWith('X');

                // Swap the acronyms with the status (=acronym -> status)
                const acronymToStatus = {};
                for (const status in statusAcronyms) {
                    acronymToStatus[statusAcronyms[status]] = status;
                }

                // Create a list of status history with the status acronyms, ignoring unknown acronyms
                const statusFilters = statusHistory
                    .split('')
                    .filter((historyItem) => historyItem in acronymToStatus)
                    .map((historyItem) => acronymToStatus[historyItem]);

                // Filter the environments by using LIKE for subsequence matching
                queryBuilder.literalWhere(
                    `${ENVIRONMENT_STATUS_HISTORY_SUBQUERY} LIKE :statusFilters`,
                    { statusFilters: `%${statusFilters.join(',')}${endsWithDone ? '' : '%'}` },
                );

                queryBuilder.includeAttribute({
                    query: ENVIRONMENT_STATUS_HISTORY_SUBQUERY,
                    alias: 'statusHistory',
                });
            }

            if (runNumbersExpression) {
                const runNumberCriteria = splitStringToStringsTrimmed(runNumbersExpression, ',');

                const finalRunNumberList = Array.from(unpackNumberRange(runNumberCriteria));

                // Check that the final run numbers list contains at least one valid run number
                if (finalRunNumberList.length > 0) {
                    queryBuilder.include({
                        association: 'runs',
                        where: {
                            // Filter should be like with only one filter and exact with more than one filter
                            runNumber: { [finalRunNumberList.length === 1 ? Op.substring : Op.in]: finalRunNumberList },
                        },
                    });
                }
            }
        }

        queryBuilder.include({ association: 'runs' });
        queryBuilder.include({ association: 'historyItems' });
        const { count, rows } = await EnvironmentRepository.findAndCountAll(queryBuilder);
        return {
            count,
            environments: rows.map((environment) => environmentAdapter.toEntity(environment)),
        };
    }
}

module.exports = GetAllEnvironmentsUseCase;
