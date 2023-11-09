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
        queryBuilder.include({ association: 'lhcPeriod' });

        if (id) {
            queryBuilder.where('id').is(id);
        }
        if (name) {
            queryBuilder.setModel('LhcPeriodStatistics')
                .whereAssociation('lhcPeriod', 'name').is(name);
        }

        const data = await LhcPeriodStatisticsRepository.findOne(queryBuilder);
        return data ? lhcPeriodStatisticsAdapter.toEntity(data) : null;
    }

    /**
     * Get all lhc periods with statistics
     * @param {Object} [options.filter] definition of filtering
     * @param {Number|Number[]} [options.filter.ids] lhcPeriod identifier to filter with
     * @param {String|String[]} [options.filter.names] lhcPeriod names to filter with
     * @param {Number} [options.page.offset] definition of pagination - offset
     * @param {Number} [options.page.limit] definition of pagination - limit
     * @param {Object<String, 'ASC'|'DESC'>[]} [options.sort] definition of sorting -
     * array of mappings of field name to order type
     * @returns {CountedData} result
     */
    async getAllForPhysicsRuns({
        filter,
        limit = ApiConfig.pagination.limit,
        offset = 0,
        sort = { name: 'desc' } } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();

        queryBuilder.include({ association: 'lhcPeriod' });

        for (const property in sort) {
            let column;
            if (property === 'name') {
                column = (sequelize) => sequelize.col('lhcPeriod.name');
            }
            queryBuilder.orderBy(column ?? property, sort[property]);
        }

        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        if (filter) {
            const { ids, names } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...Array.isArray(ids) ? ids : [ids]);
            }
            if (names) {
                queryBuilder.setModel('LhcPeriodStatistics')
                    .whereAssociation('lhcPeriod', 'name').oneOf(...Array.isArray(names) ? names : [names]);
            }
        }

        const { count, rows } = await LhcPeriodStatisticsRepository.findAndCountAll(queryBuilder);

        return {
            count,
            rows: rows.map(lhcPeriodStatisticsAdapter.toEntity),
        };
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
