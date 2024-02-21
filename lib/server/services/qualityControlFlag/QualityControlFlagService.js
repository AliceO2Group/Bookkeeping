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

/**
 * Quality control flags service
 */
class QualityControlFlagService {
    /**
     * Get all quality control flags instances
     * @param {object} [options.filter] filtering defintion
     * @param {number[]} [options.filter.ids] filtering defintion
     * @param {number[]} [options.filter.dataPassIds] filtering defintion
     * @param {number[]} [options.filter.runNumbers] filtering defintion
     * @param {number[]} [options.filter.detectorIds] filtering defintion
     * @param {number[]} [options.filter.externalUserIds] filtering defintion
     * @param {string[]} [options.filter.userNames] filtering defintion
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting
     * @return {Promise<CountedItems<QualityControlFlag>>} promise
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
            const { ids, dataPassIds, runNumbers, detectorIds, externalUserIds, userNames } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (dataPassIds) {
                queryBuilder.whereAssociation('dataPass', 'id').oneOf(...dataPassIds);
            }
            if (runNumbers) {
                queryBuilder.whereAssociation('run', 'runNumber').oneOf(...runNumbers);
            }
            if (detectorIds) {
                queryBuilder.whereAssociation('detector', 'id').oneOf(...detectorIds);
            }
            if (externalUserIds) {
                queryBuilder.whereAssociation('user', 'externalId').oneOf(...externalUserIds);
            }
            if (userNames) {
                queryBuilder.whereAssociation('user', 'name').oneOf(...userNames);
            }
        }

        const { count, rows } = await QualityControlFlagRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length,
            rows: rows.map(qualityControlFlagAdapter.toEntity),
        };
    }

    /**
     * Prepare query builder with common includes for fetching data
     * @return {QueryBuilder} common fetch-data query builder
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'flagReason' })
            .include({ association: 'user' })
            .groupBy('id');
    }
}

module.exports.QualityControlFlagService = QualityControlFlagService;

module.exports.qualityControlFlagService = new QualityControlFlagService();
