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

const { Sequelize } = require('sequelize');
const { Database } = require('../application/interfaces');

/**
 * Sequelize implementation of the Database interface.
 */
class SequelizeDatabase extends Database {
    /**
     * Creates a new `Sequelize Database` instance.
     */
    constructor() {
        super();

        let host = process.env.DATABASE_HOST || 'localhost';
        if (process.env.NODE_ENV === 'test') {
            host = 'database';
        }

        this.sequelize = new Sequelize('bookkeeping', 'cern', 'cern', {
            host,
            dialect: 'mariadb',
        });
    }

    /**
     * Returns all available models.
     */
    get models() {
        return require('./models')(this.sequelize);
    }

    /**
     * Returns all available repositories.
     */
    get repositories() {
        return require('./repositories');
    }

    /**
     * Performs connection to the database.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async connect() {
        return this.sequelize.authenticate();
    }

    /**
     * Performs disconnect to the database.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async disconnect() {
        return this.sequelize.close();
    }

    /**
     * Executes every *pending* migrations.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async migrate() {
        // This is a no-op method
    }

    /**
     * Executes every *pending* seed.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async seed() {
        // This is a no-op method
    }
}

module.exports = new SequelizeDatabase();
