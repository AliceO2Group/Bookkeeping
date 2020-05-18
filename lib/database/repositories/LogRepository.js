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

const { LogAdapter } = require('../adapters');
const {
    models: {
        Log,
        Tag,
    },
    utilities: {
        QueryBuilder,
    },
} = require('../');

/**
 * Sequelize implementation of the LogRepository.
 */
class LogRepository {
    /**
     * Returns the total number of entities.
     *
     * @returns {Promise<Number>} Promise object representing the total number of entities.
     */
    async count() {
        return Log.count();
    }

    /**
     * Returns all entities.
     *
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAll(queryBuilder) {
        return Log.findAll(queryBuilder.toImplementation()).map(LogAdapter.toEntity);
    }

    /**
     * Returns all entities.
     *
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAndCountAll(queryBuilder) {
        const { count, rows } = await Log.findAndCountAll(queryBuilder.toImplementation());
        return {
            count,
            logs: rows.map(LogAdapter.toEntity),
        };
    }

    /**
     * Returns all entities.
     *
     * @param {Object} tagId The QueryBuilder to use.
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAllByTagId(tagId, queryBuilder = new QueryBuilder()) {
        queryBuilder.include({
            model: Tag,
            as: 'tags',
            required: true,
            through: { where: { tag_id: tagId } },
        });

        return this.findAll(queryBuilder);
    }

    /**
     * Returns a specific entity.
     *
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async findOne(queryBuilder) {
        queryBuilder.limit(1);
        const result = await Log.findOne(queryBuilder.toImplementation());
        return result ? LogAdapter.toEntity(result) : null;
    }

    /**
     * Insert entity.
     *
     * @param {Object} entity entity to insert.
     * @returns {Promise} Promise object represents the just inserted Log.
     */
    async insert(entity) {
        const result = await Log.create(LogAdapter.toDatabase(entity));
        return LogAdapter.toEntity(result);
    }
}

module.exports = new LogRepository();
