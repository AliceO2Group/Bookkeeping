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

const { repositories: { QcFlagRepository } } = require('../../../database/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { qcFlagAdapter } = require('../../../database/adapters/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Quality control flags service
 */
class QcFlagService {
    /**
     * Find an Quality Control Flag by its id
     * @param {number} id identifier of Quality Control Flag
     * @return {QcFlag} a Quality Control Flag
     */
    async getById(id) {
        const queryBuilder = this.prepareQueryBuilder();
        if (!id) {
            throw new BadParameterError('Can not find without Quality Control Flag id');
        }

        queryBuilder.where('id').is(id);

        const qcFlag = await QcFlagRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find an Quality Control Flag by its id
     * @param {number} id id of Quality Control Flag
     * @throws {NotFoundError} in case there is no Quality Control Flag with given id
     * @return {Promise<QcFlag>} a Quality Control Flag
     */
    async getOneOrFail(id) {
        const qcFlag = await this.getById(id);
        if (!qcFlag) {
            const criteriaExpression = `id (${id})`;
            throw new NotFoundError(`Quality Control Flag with this ${criteriaExpression} could not be found`);
        }
        return qcFlag;
    }

    /**
     * Get all quality control flags instances
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] quality control flag ids to filter with
     * @param {number[]} [options.filter.dataPassIds] data pass ids to filter with
     * @param {number[]} [options.filter.simulationPassIds] simulation pass ids to filter with
     * @param {number[]} [options.filter.runNumbers] run numbers to filter with
     * @param {number[]} [options.filter.dplDetectorIds] dpl detector ids to filter with
     * @param {string[]} [options.filter.createdBy] user names to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QcFlag>>} promise
     */
    async getAll({ filter, sort, limit, offset } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            const { createdBy: createdByOrder, flagType: flagTypeOrder, ...otherSortProperties } = sort;
            if (createdByOrder) {
                queryBuilder.orderBy((sequelize) => sequelize.literal('`createdBy`.name'), createdByOrder);
            }
            if (flagTypeOrder) {
                queryBuilder.orderBy((sequelize) => sequelize.literal('`flagType`.name'), flagTypeOrder);
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
            const { ids, dataPassIds, runNumbers, dplDetectorIds, createdBy, simulationPassIds } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (dataPassIds) {
                queryBuilder.whereAssociation('dataPasses', 'id').oneOf(...dataPassIds);
            }
            if (simulationPassIds) {
                queryBuilder.whereAssociation('simulationPasses', 'id').oneOf(...simulationPassIds);
            }
            if (runNumbers) {
                queryBuilder.whereAssociation('run', 'runNumber').oneOf(...runNumbers);
            }
            if (dplDetectorIds) {
                queryBuilder.whereAssociation('dplDetector', 'id').oneOf(...dplDetectorIds);
            }
            if (createdBy) {
                queryBuilder.whereAssociation('createdBy', 'name').oneOf(...createdBy);
            }
        }

        const { count, rows } = await QcFlagRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length,
            rows: rows.map(qcFlagAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'flagType' })
            .include({ association: 'createdBy' })
            .groupBy('id');
    }
}

module.exports.QcFlagService = QcFlagService;

module.exports.qcFlagService = new QcFlagService();
