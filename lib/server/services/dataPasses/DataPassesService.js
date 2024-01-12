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
    async getDataPassByIdentifier({ id, name } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();
        if (id !== null & id !== undefined) {
            queryBuilder.where('id').is(id);
        } else if (name) {
            queryBuilder.setModel('LhcPeriodStatistics')
                .whereAssociation('lhcPeriod', 'name').is(name);
        } else {
            throw new BadParameterError('Can not find without LHC Period id or name');
        }

        const dataPass = await DataPassRepository.findOne(queryBuilder);
        return dataPass ? dataPassAdapter.toEntity(dataPass) : null;
    }

    /**
     * Get all lhc periods with statistics
     * @param {Object|undefined} options define which records should be fetched
     * @param {Object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.ids] lhcPeriod identifier to filter with
     * @param {string[]} [options.filter.names] lhcPeriod names to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting -
     * array of mappings of field name to order type
     * @returns {Promise<CountedItems<LhcPeriodStatistics>>} result
     */
    async getAll({
        filter,
        limit,
        offset,
        sort,
    } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();

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
            const { ids, names } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                queryBuilder.where('name').oneOf(...names);
            }
        }

        const { count, rows } = await DataPassRepository.findAndCountAll(queryBuilder);

        return {
            count,
            rows: rows.map(dataPassAdapter.toEntity),
        };
    }
}

exports.DataPassService = DataPassService;
