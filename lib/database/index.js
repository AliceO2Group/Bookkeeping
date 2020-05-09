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

const cls = require('cls-hooked');
const path = require('path');
const { Sequelize } = require('sequelize');
const Umzug = require('umzug');
const { IDatabase } = require('../application/interfaces');
const { database: Config } = require('../config');
const { Logger } = require('../utilities');

/**
 * Sequelize implementation of the Database interface.
 */
class SequelizeDatabase extends IDatabase {
    /**
     * Creates a new `Sequelize Database` instance.
     */
    constructor() {
        super();

        this.logger = Logger('database');

        this.namespace = cls.createNamespace('sequelize');
        Sequelize.useCLS(this.namespace);

        this.sequelize = new Sequelize(Config.database, Config.username, Config.password, {
            host: Config.host,
            port: Config.port,
            dialect: Config.dialect,
            dialectOptions: Config.dialectOptions,
            logging: this.logger.debug.bind(this.logger),
            define: {
                underscored: true,
            },
        });
    }

    /**
     * Returns all available models.
     */
    get models() {
        return require('./models')(this.sequelize, Sequelize);
    }

    /**
     * Returns all available repositories.
     */
    get repositories() {
        return require('./repositories');
    }

    /**
     * Returns all available utilities.
     */
    get utilities() {
        return require('./utilities')(this.sequelize);
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
        const umzug = new Umzug({
            migrations: {
                params: [this.sequelize.getQueryInterface(), Sequelize],
                path: path.join(__dirname, 'migrations'),
            },
            storage: 'sequelize',
            storageOptions: {
                sequelize: this.sequelize,
            },
        });

        return umzug.up();
    }

    /**
     * Executes every *pending* seed.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async seed() {
        const umzug = new Umzug({
            migrations: {
                params: [this.sequelize.getQueryInterface(), Sequelize],
                path: path.join(__dirname, 'seeders'),
            },
            storage: 'none',
        });

        return umzug.up();
    }
}

module.exports = new SequelizeDatabase();
