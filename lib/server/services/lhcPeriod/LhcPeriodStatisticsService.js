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

const { repositories: { LhcPeriodStatisticsRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { ApiConfig } = require('../../../config');
const { lhcPeriodStatisticsAdapter } = require('../../../database/adapters');

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
     * Find a lhc period model by its name or id including its statistics
     * @param {LhcPeriodIdentifier} identifier the criteria to find run type
     * @return {Promise<SequelizeLhcPeriod[]>} the run type found or null
     */
    async getByIdentifier({ id, name }) {
        const queryBuilder = dataSource.createQueryBuilder();
        if (id) {
            queryBuilder.where('id').is(id);
        }
        if (name) {
            queryBuilder.where('name').is(name);
        }
        queryBuilder.include({ association: 'lhcPeriod' });

        const data = await LhcPeriodStatisticsRepository.findOne(queryBuilder);
        return data ? lhcPeriodStatisticsAdapter.toEntity(data) : null;
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
            let table = null;
            // if (property === 'name') {
            //     table = 'LhcPeriodStatistics';
            // }
            // queryBuilder.orderBy(property, sort[property], table);
        }
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        if (filter) {
            const { ids, names } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...Array.isArray(ids) ? ids : [ids]);
            }
            if (names) {
                queryBuilder.whereAssociation('lhcPeriod', 'name').oneOf(...Array.isArray(names) ? names : [names]);
            }
        }
        queryBuilder.include({ association: 'lhcPeriod' });

        const { count, rows } = await LhcPeriodStatisticsRepository.findAndCountAll(queryBuilder);

        return {
            count,
            rows: rows.map(lhcPeriodStatisticsAdapter.toEntity),
        };
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
