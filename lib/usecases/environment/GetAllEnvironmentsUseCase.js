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
const EnvironmentHistoryItemRepository = require('../../database/repositories/EnvironmentHistoryItemRepository.js');
const { ApiConfig } = require('../../config/index.js');
const { Op } = require('sequelize');

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
            const { ids, currentStatusOr, currentStatusAnd } = filter;
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

            // Current status filter, either AND or an OR operation
            if (currentStatusOr) {
                // TODO: maybe not difficult, see what properties are present. Maybe I can just use status! See web app and then environments, how the current status is selected!
                /*
                 * Get all environment histories, sorted on updatedAt descending. The subtracted value will
                 * lead to a negative number, 0 or positive number, which is used for sorting
                 */
                const allEnvironmentHistories = (await EnvironmentHistoryItemRepository.findAll()).sort((a, b) => b.updatedAt - a.updatedAt);

                const temp = allEnvironmentHistories.map((environmentHistory) => environmentHistory.status);
                console.log(new Set(temp));

                /*
                 * Select the latest environment for each history item
                 * The Set filters out duplicates and only keeps the latest environments
                 */
                const uniqueEnvironments = new Set();
                allEnvironmentHistories.forEach((environmentHistory) => {
                    uniqueEnvironments.add(environmentHistory.environmentId);
                });

                console.log(uniqueEnvironments);
            } else if (currentStatusAnd) {
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
