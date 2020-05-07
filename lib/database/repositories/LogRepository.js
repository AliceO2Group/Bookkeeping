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

const { ILogRepository } = require('../../application/interfaces/database/repositories');
const { LogAdapter } = require('../adapters');
const { models: { Log } } = require('../');

/**
 * Sequelize implementation of the LogRepository interface.
 */
class LogRepository extends ILogRepository {
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
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAll() {
        return Log.findAll().map(LogAdapter.toEntity);
    }

    /**
     * Returns a specific entity.
     *
     * @param {Number} id ID primary key of the entity to find.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async find(id) {
        const result = await Log.findByPk(id);
        return result ? [LogAdapter.toEntity(result)] : null;
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
