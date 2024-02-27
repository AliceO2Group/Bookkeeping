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

const { repositories: { DataPassRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { dataPassAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * @typedef DataPassIdentifier
 * @param {number} id
 * @param {string} name
 */

/**
 * Data Pass Service
 */
class DataPassService {
    /**
     * Return one data pass
     * @param {DataPassIdentifier} identifier identifier of data pass
     * @return {DataPass} data pass
     */
    async getByIdentifier({ id, name } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (id !== null && id !== undefined) {
            queryBuilder.where('id').is(id);
        } else if (name) {
            queryBuilder.where('name').is(name);
        } else {
            throw new BadParameterError('Can not find without Data Pass id or name');
        }

        const dataPass = await DataPassRepository.findOne(queryBuilder);
        return dataPass ? dataPassAdapter.toEntity(dataPass) : null;
    }

    /**
     * Find an Data Pass model by its name or id
     * @param {DataPassIdentifier} identifier the criteria to find data pass
     * @throws {NotFoundError} in case there is no Data Pass with given identifier
     * @return {Promise<DataPass[]>} the dats pass found
     */
    async getOneOrFail({ id, name }) {
        const dataPass = await this.getByIdentifier({ id, name });
        if (!dataPass) {
            const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
            throw new NotFoundError(`Data Pass with this ${criteriaExpression} could not be found`);
        }
        return dataPass;
    }

    /**
     * Get all data passes
     * @param {object|undefined} options define which records should be fetched
     * @param {object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.lhcPeriodIds] lhcPeriod identifier to filter with
     * @param {number[]} [options.filter.ids] data passes identifier to filter with
     * @param {string[]} [options.filter.names] data passes names to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting -
     * array of mappings of field name to order type
     * @returns {Promise<CountedItems<DataPass>>} result
     */
    async getAll({
        filter,
        limit,
        offset,
        sort,
    } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            for (const property in sort) {
                queryBuilder.orderBy(property, sort[property]);
            }
        }

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        if (filter) {
            const { ids, names, lhcPeriodIds } = filter;
            if (lhcPeriodIds) {
                queryBuilder.where('lhcPeriodId').oneOf(...lhcPeriodIds);
            }
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                queryBuilder.where('name').oneOf(...names);
            }
        }

        const { count, rows } = await DataPassRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length, // When using grouping sequelize returns from finAndCountAll counts per each group
            rows: rows.map(dataPassAdapter.toEntity),
        };
    }

    /**
     * Prepare common fetch data query builder
     * @return {QueryBuilder} query builder with common includes
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .set('subQuery', false)
            .include((sequelize) => ({
                association: 'runs',
                attributes: [[sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('runs.run_number'))), 'count']],
                required: false,
            }))
            .groupBy('id');
    }
}

exports.DataPassService = DataPassService;

exports.dataPassService = new DataPassService();
