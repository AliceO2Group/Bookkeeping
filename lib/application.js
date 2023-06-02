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
const { webUiServer } = require('./server');
const { gRPCServer } = require('./server/index.js');
const { GRPCConfig } = require('./config');
const { handleLostRunsAndEnvironments } = require('./server/services/housekeeping/handleLostRunsAndEnvironments.js');

/**
 * Bookkeeping Application
 */
class BookkeepingApplication {
    /**
     * Creates a new `Bookkeeping Application` instance.
     */
    constructor() {
        this.logger = Logger('APPLICATION');
        this.webUiServer = webUiServer;
        this.gRPCServer = gRPCServer;
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

        const gRPCOrigin = GRPCConfig.origin;

        try {
            await this.webUiServer.listen();
            if (gRPCOrigin) {
                await this.gRPCServer.listen(gRPCOrigin);
            }

            // Start background housekeeping
            setInterval(async () => {
                try {
                    await handleLostRunsAndEnvironments();
                    this.logger.debug('Updated lost runs and environments');
                } catch (error) {
                    this.logger.error(`Error while handling lost logs: ${error}`);
                }
            }, 30 * 1000);
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
            await this.webUiServer.close();
        } catch (error) {
            this.logger.error(`Error while stopping: ${error}`);
            process.exit(1);
        }

        this.logger.info('Stopped');
        if (!this.isInTestMode()) {
            process.exit(0);
        }
    }

    /**
     * Begins the process of connecting to the database
     * @returns {Promise<boolean>} returns boolean if connection is successful
     */
    async connectDatabase() {
        try {
            await this.database.connect();

            if (this.isInTestMode()) {
                await this.database.dropAllTables();
            }

            await this.database.migrate();

            if (this.isInTestMode()) {
                await this.database.seed();
            }

            return true;
        } catch (error) {
            this.logger.error(`Error while starting: ${error}`);
            return false;
        }
    }

    /**
     * Getter for retro-compatibility purpose
     *
     * @return {WebUiServer} the web UI server
     */
    get server() {
        return this.webUiServer;
    }
}

module.exports = new BookkeepingApplication();
