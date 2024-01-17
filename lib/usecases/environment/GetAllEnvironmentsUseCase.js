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
const { statusAcronyms } = require('../../domain/enums/StatusAcronyms.js');
const { type } = require('os');

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
            const { ids } = filter;
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
        }

        let { count, rows } = await TransactionHelper.provide(async () => {
            queryBuilder.orderBy('updatedAt', 'desc');
            queryBuilder.limit(limit);
            queryBuilder.offset(offset);
            queryBuilder.include({ association: 'runs', separate: true });
            queryBuilder.include({ association: 'historyItems', separate: true });
            return EnvironmentRepository.findAndCountAll(queryBuilder);
        });

        // Apply these filters after getting all environments to avoid unnecessary code for getting environment status history
        if (filter?.currentStatus) {
            const filters = filter.currentStatus.split(',').map((id) => id.trim());
            rows = rows.filter((environment) => {
                const { historyItems } = environment;
                const lastHistoryItem = historyItems?.length > 0 ? historyItems[historyItems.length - 1] : null;
                return filters.includes(lastHistoryItem?.status);
            });
            count = rows.length;
        }

        if (filter?.statusHistory) {
            // Split the string into separate characters
            const filters = filter.statusHistory.split('');

            // Swap the acronyms with the status (=acronym -> status)
            const acronymToStatus = {};
            for (const status in statusAcronyms) {
                acronymToStatus[statusAcronyms[status]] = status;
            }

            // Create a list of status history with the status acronyms
            const statusFilters = [];
            for (let i = 0; i < filters.length; i++) {
                // Only add the next status if it is in the acronyms list
                if (Object.values(statusAcronyms).includes(filters[i])) {
                    // Use the acronym to get the status
                    statusFilters.push(acronymToStatus[filters[i]]);
                }
            }

            // Filter out the environments that don't have the same history sequence
            rows = rows.filter((environment) => {
                const { historyItems } = environment;
                // Check if the history has the same sequence
                for (let i = 0; i < historyItems.length; i++) {
                    if (historyItems[i].status !== statusFilters[i]) {
                        return false;
                    }
                }
                // If the history sequence is equal, this environment is valid
                return true;
            });
            count = rows.length;
        }

        if (filter?.runNumbers) {
            // Convert the string of run numbers to an array of numbers
            const filters = filter.runNumbers.split(',').map((filter) => Number(filter.trim()));
            rows = rows.filter((environment) => {
                const { runs } = environment;
                // Return if some of the runs include the filtered run numbers
                return runs.some((run) => filters.includes(run.runNumber));
            });
            count = rows.length;
        }

        return {
            count,
            environments: rows.map((environment) => environmentAdapter.toEntity(environment)),
        };
    }
}

module.exports = GetAllEnvironmentsUseCase;
