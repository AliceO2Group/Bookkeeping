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
const { DatabaseConfig } = require('../config');
const { Logger } = require('../utilities');

/**
 * Sequelize implementation of the Database.
 */
class SequelizeDatabase {
    /**
     * Creates a new `Sequelize Database` instance.
     */
    constructor() {
        this.logger = Logger('DATABASE');
        this.namespace = cls.createNamespace('sequelize');
        Sequelize.useCLS(this.namespace);

        this.sequelize = new Sequelize(DatabaseConfig.database, DatabaseConfig.username, DatabaseConfig.password, {
            host: DatabaseConfig.host,
            port: DatabaseConfig.port,
            dialect: DatabaseConfig.dialect,
            dialectOptions: DatabaseConfig.dialectOptions,
            logging: DatabaseConfig.logging ? this.logger.debug.bind(this.logger) : NaN,
            define: {
                underscored: true,
            },
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
     * Returns all available tables.
     */
    get tables() {
        return require('./tables')(this.sequelize);
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
        this.logger.info('Starting...');

        try {
            await this.sequelize.authenticate();
        } catch (error) {
            this.logger.error(`Error while starting: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Started');
    }

    /**
     * Performs disconnect to the database.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async disconnect() {
        this.logger.info('Stopping...');

        try {
            await this.sequelize.close();
        } catch (error) {
            this.logger.error(`Error while stopping: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Stopped');
    }

    /**
     * Drops all tables.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async dropAllTables() {
        this.logger.warn('Dropping all tables!');

        try {
            await this.sequelize.getQueryInterface().dropAllTables();
        } catch (error) {
            this.logger.error(`Error while dropping all tables: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Dropped all tables!');
    }

    /**
     * Executes every *pending* migrations.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async migrate() {
        this.logger.info('Executing pending migrations...');

        try {
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

            await umzug.up();
        } catch (error) {
            this.logger.error(`Error while executing migrations: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Executed pending migrations');
    }

    /**
     * Executes every *pending* seed.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async seed() {
        this.logger.info('Executing seeders...');

        try {
            const umzug = new Umzug({
                migrations: {
                    params: [this.sequelize.getQueryInterface(), Sequelize],
                    path: path.join(__dirname, 'seeders'),
                },
                storage: 'none',
            });

            await umzug.up();
        } catch (error) {
            this.logger.error(`Error while executing seeders: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Executed seeders');
    }
}

module.exports = new SequelizeDatabase();
