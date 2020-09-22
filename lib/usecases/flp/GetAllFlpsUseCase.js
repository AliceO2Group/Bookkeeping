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
        FlpRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { FlpAdapter } = require('../../database/adapters');

/**
 * GetAllFlpsUseCase
 */
class GetAllFlpsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllFlps DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { page = {}, sort = { name: 'desc' } } = query;

        const { limit = 100, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        const {
            count,
            rows,
        } = await await TransactionHelper.provide(async () => FlpRepository.findAndCountAll(queryBuilder));

        return {
            count,
            flps: rows.map(FlpAdapter.toEntity),
        };
    }
}

module.exports = GetAllFlpsUseCase;
