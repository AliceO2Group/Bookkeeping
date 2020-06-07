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

const { Logger } = require('./utilities');
const database = require('./database');
const server = require('./server');

/**
 * Bookkeeping Application
 */
class BookkeepingApplication {
    /**
     * Creates a new `Bookkeeping Application` instance.
     */
    constructor() {
        this.logger = Logger('APPLICATION');
        this.server = server;
        this.database = database;
    }

    /**
     * Returns wether or not to the application is in test mode.
     *
     * @returns {Boolean} Wether or not to the application is in test mode.
     */
    isInTestMode() {
        return process.env.NODE_ENV === 'test';
    }

    /**
     * Causes the application to be scheduled for execution.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async run() {
        this.logger.info('Starting...');

        try {
            await this.database.connect();

            if (this.isInTestMode()) {
                await this.database.dropAllTables();
            }

            await this.database.migrate();

            if (this.isInTestMode()) {
                await this.database.seed();
            }

            await this.server.listen();
        } catch (error) {
            this.logger.error(`Error while starting: ${error}`);
            return this.stop();
        }

        this.logger.info('Started');
    }

    /**
     * Begins the process of terminating the application. Calling this method terminates the process.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async stop() {
        this.logger.info('Stopping...');

        try {
            await this.database.disconnect();
            await this.server.close();
        } catch (error) {
            this.logger.error(`Error while stopping: ${error}`);
            process.exit(1);
        }

        this.logger.info('Stopped');
        if (!this.isInTestMode()) {
            process.exit(0);
        }
    }
}

module.exports = new BookkeepingApplication();
