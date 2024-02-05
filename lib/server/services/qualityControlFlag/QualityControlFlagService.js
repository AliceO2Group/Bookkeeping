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

const { repositories: { QualityControlFlagRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { qualityControlFlagAdapter } = require('../../../database/adapters');
const { QueryBuilder } = require('../../../database/utilities/QueryBuilder');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * Quality control flags service
 */
class QualityControlFlagService {
    /**
     * Create quality control flag verification
     * @return {Promise<void>} promise
     * @throws {BadParameterError}
     */
    async createVerification({ qualityControlFlagId, user, comment }) {

    }

    /**
     * Create new instance of quality control flags
     * @param {QualityControlFlag} parameters flag instance parameters
     * @return {Promise<void>} promise
     */
    async create(parameters) {
        
    }

    /**
     * Get all quality control flags instances
     * @param {object} [filter] filtering defintion
     * @param {object} [filter.dataPassIds] filtering defintion
     * @param {object} [filter.runNumbers] filtering defintion
     * @param {object} [filter.detectorIds] filtering defintion
     * @param {object} [filter.externalUserIds] filtering defintion
     * @param {object} [filter.userNames] filtering defintion
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<void>} promise
     */
    async getAll({ filter, sort } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            for (const property in sort) {
                queryBuilder.orderBy(property, sort[property]);
            }
        }

        if (filter) {
            const { dataPassIds, runNumbers, detectorIds, externalUserIds, userNames } = filter;
            if (dataPassIds) {
                queryBuilder.whereAssociation('dataPass', 'id').oneOf(...dataPassIds);
            }
            if (runNumbers) {
                queryBuilder.whereAssociation('run', 'run_number').oneOf(...runNumbers);
            }
            if (detectorIds) {
                queryBuilder.whereAssociation('detector', 'id').oneOf(...detectorIds);
            }
            if (externalUserIds) {
                queryBuilder.whereAssociation('user', 'external_id').oneOf(...externalUserIds);
            }
            if (userNames) {
                queryBuilder.whereAssociation('user', 'name').oneOf(...userNames);
            }
        }

        const { count, rows } = await QualityControlFlagRepository.findAndCountAll(queryBuilder);

        return {
            count,
            rows: rows.map(qualityControlFlagAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'verifications', include: [{ association: 'user' }] })
            .include({ association: 'flagReason' })
            .include({ association: 'user' })
            .groupBy('id');
    }
}

// module.exports.QualityControlFlagService = QualityControlFlagService;
module.exports.qualityControlFlagService = new QualityControlFlagService();
