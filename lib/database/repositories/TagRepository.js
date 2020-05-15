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

const { TagAdapter } = require('../adapters');
const { models: { Tag } } = require('../');

/**
 * Sequelize implementation of the TagRepository.
 */
class TagRepository {
    /**
     * Returns the total number of entities.
     *
     * @returns {Promise<Number>} Promise object representing the total number of entities.
     */
    async count() {
        return Tag.count();
    }

    /**
     * Returns all entities.
     *
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAll(queryBuilder) {
        return Tag.findAll(queryBuilder.toImplementation()).map(TagAdapter.toEntity);
    }

    /**
     * Returns a specific entity.
     *
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async findOne(queryBuilder) {
        queryBuilder.limit(1);
        const result = await Tag.findOne(queryBuilder.toImplementation());
        return result ? TagAdapter.toEntity(result) : null;
    }

    /**
     * Insert entity.
     *
     * @param {Object} entity entity to insert.
     * @returns {Promise} Promise object represents the just inserted Tag.
     */
    async insert(entity) {
        const result = await Tag.create(TagAdapter.toDatabase(entity));
        return TagAdapter.toEntity(result);
    }
}

module.exports = new TagRepository();
