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

const { repositories: { LhcPeriodRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { ApiConfig } = require('../../../config');
const { lhcPeriodAdapter } = require('../../../database/adapters');

/**
 * @typedef LhcPeriodIdentifier object to uniquely identify a lhc period
 * @property {string} [name] the lhc period name
 * @property {number} [id] the id of lhc period
 */

/**
 * LhcPeriodStatisticsService
 */
class LhcPeriodStatisticsService {
    /**
     * Find a lhc period model by its name or id
     * @param {LhcPeriodIdentifier} identifier the criteria to find run type
     * @return {Promise<SequelizeLhcPeriod[]>} the run type found or null
     */
    async getByIdentifier({ id, name }) {
        return lhcPeriodAdapter.toEntity(await LhcPeriodRepository.findOne({ id, name }));
    }

    /**
     * Get all lhc periods with statistics
     * @param {Object} [options.filter] definition of filtering
     * @param {Number} [options.page.offset] definition of pagination - offset
     * @param {Number} [options.page.limit] definition of pagination - limit
     * @param {Object<String, String>[]} [options.sort] definition of sorting - array of objects like { [FIELD_NAME]: 'DESC' or 'ASC' }
     * @returns {CountedData} result
     */
    async getAllForPhysicsRuns({ filter, page = {}, sort = { name: 'desc' } } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();

        for (const property in sort) {
            queryBuilder.orderBy(property, sort[property]);
        }
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        if (filter) {
            const { ids, names } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(ids);
            }
            if (names) {
                queryBuilder.where('name').oneOf(names);
            }
        }

        const { count, rows } = await LhcPeriodRepository.findAndCountAll(queryBuilder);

        return {
            count,
            rows: rows.map(lhcPeriodAdapter.toEntity),
        };
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
