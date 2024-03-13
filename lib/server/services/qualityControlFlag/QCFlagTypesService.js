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
 * Quality control flags service
 */
class QCFlagTypesService {
    /**
     * Find an Quality Control Flag Type by its identifier
     * @param {number} id identifier of Quality Control Flag Type
     * @return {QCFlagType} a Quality Control Flag Type
     */
    async getById(id) {
        const queryBuilder = this.prepareQueryBuilder();

        if (id !== null && id !== undefined) {
            queryBuilder.where('id').is(id);
        } else {
            throw new BadParameterError('Can not find without Quality Control Flag Type id');
        }

        const qcFlag = await QCFlagTypeRepository.findOne(queryBuilder);
        return qcFlag ? qcFlagTypeAdapter.toEntity(qcFlag) : null;
    }

    /**
     * Find an Quality Control Flag Type by its identifier or fails
     * @param {number} id identifier of Quality Control Flag Type
     * @throws {NotFoundError} in case there is no Quality Control Flag Type with given id
     * @return {Promise<QCFlagType>} a Quality Control Flag Type
     */
    async getOneOrFail(id) {
        const qcFlag = await this.getById(IDBDatabase);
        if (!qcFlag) {
            const criteriaExpression = `id (${id})`;
            throw new NotFoundError(`Quality Control Flag Type with this ${criteriaExpression} could not be found`);
        }
        return qcFlag;
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
