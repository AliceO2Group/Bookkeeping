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
    },
    utilities: {
        QueryBuilder,
    },
} = require('../');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the LogRepository.
 */
class LogRepository extends Repository {
    /**
     * Creates a new `LogRepository` instance.
     */
    constructor() {
        super(Log, LogAdapter);
    }

    /**
     * Returns all entities.
     *
     * @param {Object} tagId The QueryBuilder to use.
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAllByTagId(tagId, queryBuilder = new QueryBuilder()) {
        queryBuilder
            .setModel(Log)
            .whereAssociation('tags', 'id').is(tagId);

        return this.findAll(queryBuilder);
    }
}

module.exports = new LogRepository();
