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

const { repositories: { QCFlagTypeRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagTypeAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * @typedef QCFlagTypeIdentifier
 * @param {number} id
 * @param {string} name
 */

/**
 * Quality control flags service
 */
class QcFlagTypesService {
    /**
     * Find an Quality Control Flag Type by its identifier
     * @param {QCFlagTypeIdentifier} identifier identifier of Quality Control Flag Type
     * @return {QCFlagType} a Quality Control Flag Type
     */
    async getByIdentifier({ id, name }) {
        const queryBuilder = this.prepareQueryBuilder();

        if (id !== null && id !== undefined) {
            queryBuilder.where('id').is(id);
        } else if (name) {
            queryBuilder.where('name').is(name);
        } else {
            throw new BadParameterError('Can not find without Quality Control Flag Type id');
        }

        const qcFlag = await QCFlagTypeRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagTypeAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find an Quality Control Flag Type by its identifier or fails
     * @param {QCFlagTypeIdentifier} identifier identifier of Quality Control Flag Type
     * @throws {NotFoundError} in case there is no Quality Control Flag Type with given id
     * @return {Promise<QCFlagType>} a Quality Control Flag Type
     */
    async getOneOrFail({ id, name }) {
        const qcFlag = await this.getByIdentifier({ id });
        if (!qcFlag) {
            const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
            throw new NotFoundError(`Quality Control Flag Type with this ${criteriaExpression} could not be found`);
        }
        return qcFlag;
    }

    /**
     * Get all quality control flag types
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] quality control flag ids to filter with
     * @param {string[]|{like: string[]}} [options.filter.names] quality control flag type name to filter with
     * @param {string[]|{like: string[]}} [options.filter.methods] quality control flag type method to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QCFlagType>>} promise
     */
    async getAll({ filter, sort, limit, offset } = {}) {
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
            const { ids, names, methods, bad } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                if (Array.isArray(names)) {
                    queryBuilder.where('name').oneOf(...names);
                } else {
                    queryBuilder.where('name').oneOfSubstrings(names.like);
                }
            }
            if (methods) {
                if (Array.isArray(methods)) {
                    queryBuilder.where('method').oneOf(...methods);
                } else {
                    queryBuilder.where('method').oneOfSubstrings(methods.like);
                }
            }
            if (bad !== undefined) {
                queryBuilder.where('bad').is(bad);
            }
        }

        const { count, rows } = await QCFlagTypeRepository.findAndCountAll(queryBuilder);

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

module.exports.QcFlagTypesService = QcFlagTypesService;

module.exports.qcFlagTypesService = new QcFlagTypesService();
