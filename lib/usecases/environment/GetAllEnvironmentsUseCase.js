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
                // History items is an association, so it needs to be included
                queryBuilder.include({
                    association: 'historyItems',
                    // Use separate to get the history items in a separate query, this allows order and limit
                    separate: true,
                    // Order by createdAt DESC to get the last history item on top
                    order: [['createdAt', 'DESC']],
                    // Only select the last history item, since it is ordered
                    limit: 1,
                    // Select only the environment that has the current status from the filters
                    where: {
                        status: { [Op.in]: filters },
                    },
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
