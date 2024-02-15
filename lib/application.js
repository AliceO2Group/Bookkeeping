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
const { GRPCConfig, ServicesConfig } = require('./config');

const { monalisa: monalisaConfig } = ServicesConfig;
const { handleLostRunsAndEnvironments } = require('./server/services/housekeeping/handleLostRunsAndEnvironments.js');
const { isInTestMode } = require('./utilities/env-utils.js');
const { ScheduledProcessesManager } = require('./server/services/ScheduledProcessesManager.js');
const { MonALISASynchronizer } = require('./server/monalisa-synchronization/MonALISASynchronizer');
const { createMonALISAClient } = require('./server/monalisa-synchronization/MonALISAClient');

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

        this.scheduledProcessesManager = new ScheduledProcessesManager();
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

            if (monalisaConfig.enableSynchronization) {
                const monAlisaSynchronizer = await this.createMonALISASynchronizer();
                this.scheduledProcessesManager.schedule(
                    async () => {
                        await monAlisaSynchronizer.synchronizeDataPassesFromMonALISA();
                        await monAlisaSynchronizer.synchronizeSimulationPassesFromMonAlisa();
                    },
                    {
                        wait: 10 * 1000,
                        every: monalisaConfig.synchronizationPeriod,
                    },
                );
            }

            if (ServicesConfig.enableHousekeeping) {
                this.scheduledProcessesManager.schedule(
                    () => this.housekeeping(),
                    {
                        wait: 30 * 1000,
                        every: 30 * 1000,
                    },
                );
            }
        } catch (error) {
            this.logger.error(`Error while starting: ${error}`);
            return this.stop();
        }

        this.logger.info('Started');
    }

    /**
     * Instantiate MonALISA synchronizer with global configuration
     * @return {MonALISASynchronizer} instance
     */
    async createMonALISASynchronizer() {
        return new MonALISASynchronizer(await createMonALISAClient({
            dataPassesUrl: monalisaConfig.dataPassesUrl,
            dataPassDetailsUrl: monalisaConfig.dataPassDetailsUrl,
            simulationPassesUrl: monalisaConfig.simulationPassesUrl,
            yearLowerLimit: monalisaConfig.dataPassesYearLowerLimit,
            userCertificatePath: monalisaConfig.userCertificate.path,
            certificatePassphrase: monalisaConfig.userCertificate.passphrase,
        }));
    }

    /**
     * Houskeeping method, it wraps @see handleLostRunsAndEnvironments and logs its results
     * @return {Promise<void>} promise
     */
    async housekeeping() {
        try {
            const { transitionedEnvironments, endedRuns } = await handleLostRunsAndEnvironments();
            const subMessages = [];
            if (transitionedEnvironments.length > 0) {
                subMessages.push(`environments (${transitionedEnvironments.join(', ')})`);
            }
            if (endedRuns.length > 0) {
                subMessages.push(`runs (${endedRuns.join(', ')})`);
            }

            if (subMessages.length > 0) {
                this.logger.debug(`Updated lost ${subMessages.join(' and ')}`);
            }
        } catch (error) {
            this.logger.error(`Error while handling lost runs & environments: ${error}`);
        }
    }

    /**
     * Begins the process of terminating the application. Calling this method terminates the process.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async stop() {
        this.logger.info('Stopping...');

        this.scheduledProcessesManager.cleanup();
        try {
            await this.database.disconnect();
            await this.webUiServer.close();
        } catch (error) {
            this.logger.error(`Error while stopping: ${error}`);
            process.exit(1);
        }

        this.logger.info('Stopped');
        if (!isInTestMode()) {
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

            if (isInTestMode()) {
                await this.database.dropAllTables();
            }

            await this.database.migrate();

            if (isInTestMode()) {
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
