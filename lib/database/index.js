/* eslint-disable require-jsdoc */
/* eslint-disable valid-jsdoc */
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

const path = require('path');
const { Sequelize } = require('sequelize');
const Umzug = require('umzug');
const { Database } = require('../application/interfaces');

/**
 * Sequelize implementation of the Database interface.
 */
class SequelizeDatabase extends Database {
    /**
     * Creates a new `SequelizeDatabase` instance.
     */
    constructor() {
        super();

        let host = '127.0.0.1';
        if (process.env.NODE_ENV === 'test') {
            host = 'database';
        }

        this.sequelize = new Sequelize('bookkeeping', 'cern', 'cern', {
            host,
            dialect: 'mariadb',
        });

        this.umzug = {
            migrations: {
                params: [this.sequelize.getQueryInterface()],
            },
            storage: 'sequelize',
            storageOptions: {
                sequelize: this.sequelize,
            },
        };
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
        const umzug = new Umzug(Object.assign(this.umzug, {
            migrations: {
                path: path.join(__dirname, 'migrations'),
            },
        }));

        return umzug.up();
    }

    /**
     * Executes every *pending* seed.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async seed() {
        const umzug = new Umzug(Object.assign(this.umzug, {
            migrations: {
                path: path.join(__dirname, 'seeders'),
            },
        }));

        return umzug.up();
    }
}

module.exports = new SequelizeDatabase();
