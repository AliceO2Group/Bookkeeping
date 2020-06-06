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

const { SubsystemAdapter } = require('../adapters');
const {
    models: {
        Subsystem,
    },
} = require('../');

/**
 * Sequelize implementation of the SubsystemRepository.
 */
class SubsystemRepository {
    /**
     * Returns all entities.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAll(queryBuilder) {
        return Subsystem.findAll(queryBuilder.toImplementation()).map(SubsystemAdapter.toEntity);
    }

    /**
     * Returns all entities.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAndCountAll(queryBuilder) {
        queryBuilder.set('distinct', true);

        const { count, rows } = await Subsystem.findAndCountAll(queryBuilder.toImplementation());
        return {
            count,
            subsystems: rows.map(SubsystemAdapter.toEntity),
        };
    }

    /**
     * Returns a specific entity.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async findOne(queryBuilder) {
        queryBuilder.limit(1);
        const result = await Subsystem.findOne(queryBuilder.toImplementation());
        return result ? SubsystemAdapter.toEntity(result) : null;
    }

    /**
     * Inserts a specific entity.
     *
     * @param {Object} entity The entity to insert.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async insert(entity){
        const result = await Subsystem.create(SubsystemAdapter.toDatabase(entity));
        return SubsystemAdapter.toEntity(result);
    }

    /**
     * Removes a specific entity.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async removeOne(queryBuilder) {
        queryBuilder.limit(1);

        const tag = await this.findOne(queryBuilder);
        if (tag) {
            await Subsystem.destroy(queryBuilder.toImplementation());
        }

        return tag;
    }
}

module.exports = new SubsystemRepository();
