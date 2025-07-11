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

const { Op } = require('sequelize');
const { repositories: { QcFlagTypeRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagTypeAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { ConflictError } = require('../../errors/ConflictError.js');
const { NotFoundError } = require('../../errors/NotFoundError');
const { getUserOrFail } = require('../user/getUserOrFail');

const DEFAULT_BAD_FLAG_COLOR = '#d62631';
const DEFAULT_NOT_BAD_FLAG_COLOR = '#4caf50';

/**
 * Quality control flag types service
 */
class QcFlagTypeService {
    /**
     * Find a Quality Control Flag Type by its identifier
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
     * Create new QC Flag Type
     * @param {Partial<QcFlagType>} [parameters] qc flag parameters
     * @param {object} [relations] QC Flag Type entity relations
     * @param {Partial<UserIdentifier>} [relations.user] user identifiers
     * @return {Promise<QcFlagType>} promise
     */
    async create(parameters, relations = {}) {
        const {
            name,
            method,
            bad,
            color,
        } = parameters;
        const { user: { userId, externalUserId } = {} } = relations;

        const user = await getUserOrFail({ userId, externalUserId });

        const existingQcFlagType = await QcFlagTypeRepository.findOne({
            where: { [Op.or]: [{ name }, { method }] },
        });
        if (existingQcFlagType) {
            throw new ConflictError(`A QC flag type with name ${name} or method ${method} already exists`);
        }

        const newFlagInstance = await QcFlagTypeRepository.insert({
            name,
            method,
            bad,
            color: color ?? (bad ? DEFAULT_BAD_FLAG_COLOR : DEFAULT_NOT_BAD_FLAG_COLOR),
            createdById: user.id,
        });
        return qcFlagTypeAdapter.toEntity(await this.getById(newFlagInstance.id));
    }

    /**
     * Update existing QC Flag Type
     * @param {number} [id] QC flag type id
     * @param {Partial<QcFlagType>} [patch] QC flag type parameters
     * @param {object} [relations] QC flag type entity relations
     * @param {Partial<UserIdentifier>} [relations.user] user identifiers
     * @return {Promise<QCFlagType>} promise
     */
    async update(id, patch, relations = {}) {
        const {
            name,
            method,
            bad,
            color,
            archived,
        } = patch;
        const { user: { userId, externalUserId } = {} } = relations;

        return dataSource.transaction(async () => {
            const user = await getUserOrFail({ userId, externalUserId });

            const qcFlagType = await QcFlagTypeRepository.findOne({ where: { id } });
            if (!qcFlagType) {
                throw new NotFoundError(`Quality Control Flag Type with this id (${id}) could not be found`);
            }

            const conflictingQcFlagType = await QcFlagTypeRepository.findOne({
                where: { [Op.not]: { id }, [Op.or]: [name ? { name } : {}, method ? { method } : {}] },
            });
            if (conflictingQcFlagType) {
                const failureReason = [name ? `name ${name}` : null, method ? `method ${method}` : null].filter((_) => _).join(' or ');
                throw new ConflictError(`A QC flag with ${failureReason} already exists`);
            }

            await QcFlagTypeRepository.update(qcFlagType, {
                name,
                method,
                bad,
                color,
                lastUpdatedById: user.id,
                archivedAt: archived === true && !qcFlagType.archived
                    ? new Date()
                    : archived === false
                        ? null
                        : undefined,
            });

            return qcFlagTypeAdapter.toEntity(await this.getById(id));
        });
    }

    /**
     * Get all quality control flag types
     *
     * @param {object} [options] fetch options
     * @param {object} [options.filter] filtering definition
     * @param {number} [options.offset] parameter related to pagination - offset
     * @param {number} [options.limit] parameter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QcFlagType>>} promise
     */
    async getAll({ filter, sort, limit, offset } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            const { archived: archivedOrder, ...otherSortProperties } = sort;
            if (archivedOrder) {
                queryBuilder.orderBy((sequelize) => sequelize.literal('archived_at IS NULL'), archivedOrder);
            }
            for (const property in otherSortProperties) {
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
            /**
             * @typedef
             * @property {object} filter
             * @property {number[]} [filter.ids] quality control flag ids to filter with
             * @property {boolean} [filter.bad] quality control flag boolean to filter bad or not-bad QC flags
             * @property {boolean} [filter.archived] quality control flag boolean to filter archived or not-archived QC flags
             * @property {string[]} [filter.names] quality control flag type name to filter with, single token is treated as pattern
             * @property {string[]} [filter.methods] quality control flag type method to filter with, single token is treated as pattern
             */
            const { ids, names, methods, bad, archived } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names?.length) {
                if (names.length > 1) {
                    queryBuilder.where('name').oneOf(...names);
                } else {
                    queryBuilder.where('name').substring(names[0]);
                }
            }
            if (methods?.length) {
                if (methods.length > 1) {
                    queryBuilder.where('method').oneOf(...methods);
                } else {
                    queryBuilder.where('method').substring(methods[0]);
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
