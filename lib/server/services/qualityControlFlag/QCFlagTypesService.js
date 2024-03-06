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

const sequelize = require('sequelize');
const { repositories: { QCFlagTypeRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagTypeAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');
const { getUserOrFail } = require('../user/getUserOrFail');
const { ConflictError } = require('../../errors/ConflictError');

/**
 * @typedef QCFlagTypeIdentifier
 * @param {number} id
 * @param {string} name
 */

/**
 * Quality control flags service
 */
class QCFlagTypesService {
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
     * Create new QC Flag Type
     * @param {object} [parameters] qc flag parameters
     * @param {string} [parameters.name] qc flag name
     * @param {string} [parameters.method] qc flag method
     * @param {boolean} [parameters.bad] qc flag bad attribute
     * @param {string} [parameters.color] qc flag color
     * @param {number} [parameters.userId] qc flag creator id
     * @param {number} [parameters.externalUserId] qc flag creator external id
     * @return {Promise<QCFlagType>} promise
     */
    async create(parameters) {
        const {
            name,
            method,
            bad,
            color,
            userId,
            externalUserId,
        } = parameters;

        const user = await getUserOrFail({ userId, externalUserId });
        if (color && !/#[0-9a-fA-F]{6}/.test(color)) {
            throw new BadParameterError(`Incorrect format of the color provided (${color})`);
        }

        const newFlagInstance = await QCFlagTypeRepository.insert({
            name,
            method,
            bad,
            color,
            createdById: user.id,
        });

        return qcFlagTypeAdapter.toEntity(await this.getByIdentifier({ id: newFlagInstance.id }));
    }

    /**
     * Update existing QC Flag Type
     * @param {number} [id] if of QC Flag Type to be updated
     * @param {object} [patch] qc flag parameters
     * @param {string} [patch.name] qc flag name
     * @param {string} [patch.method] qc flag method
     * @param {boolean} [patch.bad] qc flag bad attribute
     * @param {string} [patch.color] qc flag color as hash (#) followed by six hexadecimal digits, e.g. #a01ff2b
     * @param {number} [patch.userId] qc flag creator id
     * @param {number} [patch.externalUserId] qc flag creator external id
     * @return {Promise<QCFlagType>} promise
     */
    async update(id, patch) {
        const {
            name,
            method,
            bad,
            color,
            userId,
            archived,
            externalUserId,
        } = patch;

        const user = await getUserOrFail({ userId, externalUserId });
        const qcFlagType = await QCFlagTypeRepository.findOne({ where: { id } });
        if (!qcFlagType) {
            throw new NotFoundError(`Quality Control Flag Type with this id (${id}) could not be found`);
        }
        if (color && !/#[0-9a-fA-F]{6}/.test(color)) {
            throw new BadParameterError(`Incorrect format of the color provided (${color})`);
        }

        try {
            await QCFlagTypeRepository.update(qcFlagType, {
                name,
                method,
                bad,
                color,
                lastUpdatedById: user.id,
                archivedAt: archived === true && !qcFlagType.archvied
                    ? new Date()
                    : archived === false
                        ? null
                        : undefined,
            });

            return qcFlagTypeAdapter.toEntity(await this.getByIdentifier({ id }));
        } catch (sequelizeError) {
            if (sequelizeError instanceof sequelize.ValidationError) {
                throw new ConflictError(sequelizeError.errors.map(({ message }) => message).join(';'));
            } else {
                throw sequelizeError;
            }
        }
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

module.exports.QCFlagTypesService = QCFlagTypesService;

module.exports.qcFlagTypesService = new QCFlagTypesService();
