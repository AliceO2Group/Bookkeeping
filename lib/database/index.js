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
const { Umzug, SequelizeStorage, memoryStorage } = require('umzug');
const { DatabaseConfig } = require('../config');
const { Logger } = require('../utilities');
const models = require('./models/index.js');
const tables = require('./tables/index.js');
const utilities = require('./utilities/index.js');

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
            logging: DatabaseConfig.logging ? this.logger.debug.bind(this.logger) : false,
            define: {
                underscored: true,
            },
        });

        this._models = models(this.sequelize);
        this._tables = tables(this.sequelize);
        this._utilities = utilities(this.sequelize);
    }

    /**
     * Returns all available models.
     */
    get models() {
        return this._models;
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
        return this._tables;
    }

    /**
     * Returns all available utilities.
     */
    get utilities() {
        return this._utilities;
    }

    /**
     * Performs connection to the database, and retry until success
     *
     * @returns {Promise} resolves once the connection has been done
     */
    async connect() {
        this.logger.debug('Starting bookkeeping database connection');
        const retryThrottle = 5000;

        let success = false;
        let failedOnce = false;
        while (!success) {
            const attemptTime = Date.now();

            const authenticationPromise = this.sequelize.authenticate();
            authenticationPromise.catch((error) => {
                const retryIn = attemptTime + retryThrottle - Date.now();
                if (!failedOnce) {
                    this.logger.error(`Error while starting bookkeeping database connection: ${error}`);
                    failedOnce = true;
                }

                if (retryIn > 0) {
                    this.logger.debug(`New bookkeeping database connection attempt in ${retryIn} ms`);
                }
            });

            await Promise.allSettled([
                authenticationPromise,
                new Promise((resolve) => setTimeout(() => resolve(), retryThrottle)),
            ]).then(([{ status }]) => {
                if (status !== 'rejected') {
                    success = true;
                }
            });
        }
        this.logger.debug('Bookkeeping database connected');
    }

    /**
     * Ping for database following sequelize documentation
     * @returns {Boolean} database status
     */
    async ping() {
        try {
            await this.sequelize.authenticate();
            return true;
        } catch (error) {
            this.logger.error('Database error');
            this.logger.error(error);
            return false;
        }
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
            const umzug = this.getUmzug(
                path.join(__dirname, 'migrations'),
                new SequelizeStorage({
                    sequelize: this.sequelize,
                }),
            );

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
            const umzug = this.getUmzug(path.join(__dirname, 'seeders'), memoryStorage());
            await umzug.up();
        } catch (error) {
            this.logger.error(`Error while executing seeders: ${error}`);
            return Promise.reject(error);
        }

        this.logger.info('Executed seeders');
    }

    /**
     * Returns a new Umzug instance for the given migration directory and storage
     *
     * @param {string} migrationsDirectory the path to the migrations directory
     * @param {string} storage the data storage to use
     * @return {Umzug} the Umzug instance
     */
    getUmzug(migrationsDirectory, storage) {
        return new Umzug({
            migrations: {
                glob: `${migrationsDirectory}/*.js`,
                resolve: ({ name, path: migrationPath, context }) => {
                    const migration = require(migrationPath || '');

                    return {
                        name,
                        up: async () => migration.up(context, Sequelize),
                        down: async () => migration.down(context, Sequelize),
                    };
                },
            },
            context: this.sequelize.getQueryInterface(),
            storage,
        });
    }
}

module.exports = new SequelizeDatabase();
