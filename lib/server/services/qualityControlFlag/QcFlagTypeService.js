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

const { repositories: { QcFlagTypeRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagTypeAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * Quality control flag types service
 */
class QcFlagTypeService {
    /**
     * Find an Quality Control Flag Type by its identifier
     * @param {number} id identifier of Quality Control Flag Type
     * @return {QcFlagType} a Quality Control Flag Type
     */
    async getById(id) {
        const queryBuilder = this.prepareQueryBuilder();

        if (id !== null && id !== undefined) {
            queryBuilder.where('id').is(id);
        } else {
            throw new BadParameterError('Can not find without Quality Control Flag Type id');
        }

        const qcFlag = await QcFlagTypeRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagTypeAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find an Quality Control Flag Type by its identifier or fails
     * @param {number} id identifier of Quality Control Flag Type
     * @throws {NotFoundError} in case there is no Quality Control Flag Type with given id
     * @return {Promise<QcFlagType>} a Quality Control Flag Type
     */
    async getOneOrFail(id) {
        const qcFlag = await this.getById(id);
        if (!qcFlag) {
            const criteriaExpression = `id (${id})`;
            throw new NotFoundError(`Quality Control Flag Type with this ${criteriaExpression} could not be found`);
        }
        return qcFlag;
    }

    /**
     * Get all quality control flag types
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] quality control flag ids to filter with
     * @param {boolean} [options.filter.bad] quality control flag boolean to filter bad or not-bad QC flags
     * @param {boolean} [options.filter.archived] quality control flag boolean to filter arhived or not-archived QC flags
     * @param {string[]} [options.filter.names] quality control flag type name to filter with, single token is treated as pattern
     * @param {string[]} [options.filter.methods] quality control flag type method to filter with, single token is treated as pattern
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QCFlagType>>} promise
     */
    async getAll({ filter, sort, limit, offset } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            for (const property in sort) {
                if (property === 'archived') {
                    queryBuilder.orderBy((sequelize) => sequelize.literal('archived_at IS NULL'), sort[property]);
                } else {
                    queryBuilder.orderBy(property, sort[property]);
                }
            }
        }

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        if (filter) {
            const { ids, names, methods, bad, archived } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                if (names.length > 1) {
                    queryBuilder.where('name').oneOf(...names);
                } else {
                    queryBuilder.where('name').oneOfSubstrings(names);
                }
            }
            if (methods) {
                if (methods.length > 1) {
                    queryBuilder.where('method').oneOf(...methods);
                } else {
                    queryBuilder.where('method').oneOfSubstrings(methods);
                }
            }
            if (bad !== undefined) {
                queryBuilder.where('bad').is(bad);
            }
            if (archived !== undefined) {
                queryBuilder.literalWhere(`archived_at is ${archived ? 'NOT NULL' : 'NULL'}`);
            }
        }

        const { count, rows } = await QcFlagTypeRepository.findAndCountAll(queryBuilder);

        return {
            count: count,
            rows: rows.map(qcFlagTypeAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'createdBy' })
            .include({ association: 'lastUpdatedBy' });
    }
}

module.exports.QcFlagTypeService = QcFlagTypeService;

module.exports.qcFlagTypeService = new QcFlagTypeService();
