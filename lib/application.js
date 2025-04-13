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

const database = require('./database');
const { webUiServer } = require('./server');
const { GRPCConfig, ServicesConfig } = require('./config');

const { userCertificate, monalisa: monalisaConfig, ccdb: ccdbConfig, enableHousekeeping } = ServicesConfig;
const { handleLostRunsAndEnvironments } = require('./server/services/housekeeping/handleLostRunsAndEnvironments.js');
const { isInTestMode } = require('./utilities/env-utils.js');
const { ScheduledProcessesManager } = require('./server/services/ScheduledProcessesManager.js');
const { MonAlisaSynchronizer } = require('./server/externalServicesSynchronization/monalisa/MonAlisaSynchronizer');
const { LogManager } = require('@aliceo2/web-ui');
const { Kafka } = require('kafkajs');
const { KafkaConfig } = require('./config/index.js');
const { AliEcsSynchronizer } = require('./server/kafka/AliEcsSynchronizer.js');
const { environmentService } = require('./server/services/environment/EnvironmentService.js');
const { runService } = require('./server/services/run/RunService.js');
const { CcdbSynchronizer } = require('./server/externalServicesSynchronization/ccdb/CcdbSynchronizer.js');
const { promises: fs } = require('fs');
const { MonAlisaClient } = require('./server/externalServicesSynchronization/monalisa/MonAlisaClient.js');
const https = require('https');
const { InfologgerKafkaLogCreator } = require('./server/kafka/InfologgerKafkaLogCreator.js');
const { GRPCServer } = require('./server/GRPCServer.js');

/**
 * Bookkeeping Application
 */
class BookkeepingApplication {
    /**
     * Creates a new `Bookkeeping Application` instance.
     */
    constructor() {
        this._logger = LogManager.getLogger('APPLICATION');
        this.webUiServer = webUiServer;
        this.database = database;

        this.scheduledProcessesManager = new ScheduledProcessesManager();

        this._externalServicesHttpAgent = null;
    }

    /**
     * Causes the application to be scheduled for execution.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async run() {
        this._logger.infoMessage('Starting...');

        try {
            await this.webUiServer.listen();
            await this.startGrpcServers();
            await this.startAliEcsSynchronization();
            await this.startCcdbSynchronization();

            if (monalisaConfig.enableSynchronization || enableHousekeeping) {
                await this.startMonalisaSynchronization(httpAgent);

                await this.startHousekeeping(httpAgent);
            }
        } catch (error) {
            this._logger.errorMessage(`Error while starting: ${error}`);
            return this.stop();
        }

        this._logger.infoMessage('Started');
    }

    async startGrpcServers() {
        const gRPCInternalOrigin = GRPCConfig.origin.internal;
        const gRPCAuthenticatedOrigin = GRPCConfig.origin.authenticated;
        if (gRPCInternalOrigin) {
            const gRPCInternalServer = new GRPCServer();
            await gRPCInternalServer.listen(gRPCInternalOrigin);
        }
        if (gRPCAuthenticatedOrigin) {
            const gRPCAuthenticatedServer = new GRPCServer(webUiServer.http.o2TokenService);
            await gRPCAuthenticatedServer.listen(gRPCAuthenticatedOrigin);
        }
    }

    async startCcdbSynchronization() {
        if (ccdbConfig.enableSynchronization) {
            const ccdbSynchronizer = new CcdbSynchronizer(ccdbConfig.runInfoUrl);
            this.scheduledProcessesManager.schedule(
                // Sync runs a few sync period ago in case some synchronization failed
                () => ccdbSynchronizer.syncFirstAndLastTf(new Date(Date.now() - ccdbConfig.synchronizationPeriod * 5)),
                {
                    wait: 10 * 1000,
                    every: ccdbConfig.synchronizationPeriod,
                },
            );
        }
    }

    async startMonalisaSynchronization(httpAgent) {
        if (monalisaConfig.enableSynchronization) {
            const monAlisaSynchronizer = await this.createMonAlisaSynchronizer(httpAgent);
            this.scheduledProcessesManager.schedule(
                () => monAlisaSynchronizer.synchronize(),
                {
                    wait: 10 * 1000,
                    every: monalisaConfig.synchronizationPeriod,
                },
            );
        }
    }

    async startAliEcsSynchronization() {
        if (KafkaConfig.consumeEcsMessages) {
            const kafkaClient = new Kafka({
                clientId: 'bookkeeping',
                brokers: KafkaConfig.brokers,
                logCreator: InfologgerKafkaLogCreator,
                retry: {
                    retries: Infinity,
                },
            });

            const aliEcsSynchronizer = new AliEcsSynchronizer({
                kafkaClient,
                environmentService,
                runService,
            });

            await aliEcsSynchronizer.start();
        }
    }

    async startHousekeeping(httpAgent) {
        if (enableHousekeeping) {
            this.scheduledProcessesManager.schedule(
                () => this.housekeeping(httpAgent),
                {
                    wait: 30 * 1000,
                    every: 30 * 1000,
                },
            );
        }
    }

    /**
     * Begins the process of terminating the application. Calling this method terminates the process.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async stop() {
        this._logger.infoMessage('Stopping...');

        this.scheduledProcessesManager.cleanup();
        try {
            await this.database.disconnect();
            await this.webUiServer.close();
        } catch (error) {
            this._logger.errorMessage(`Error while stopping: ${error}`);
            process.exit(1);
        }

        this._logger.infoMessage('Stopped');
        if (!isInTestMode()) {
            process.exit(0);
        }
    }

    /**
     * Instantiate MonAlisa synchronizer with global configuration
     *
     * @param {Agent} agent the HTTP agent to be used by synchronizer
     * @return {Promise<MonAlisaSynchronizer>} resolves with MonAlisaSynchronizer instance
     */
    async createMonAlisaSynchronizer(agent) {
        return new MonAlisaSynchronizer(new MonAlisaClient({
            dataPassesUrl: monalisaConfig.dataPassesUrl,
            dataPassDetailsUrl: monalisaConfig.dataPassDetailsUrl,
            simulationPassesUrl: monalisaConfig.simulationPassesUrl,
            yearLowerLimit: monalisaConfig.dataPassesYearLowerLimit,
            agent,
        }));
    }

    /**
     * Housekeeping method, it wraps @see handleLostRunsAndEnvironments and logs its results
     *
     * @param {Agent} httpAgent agent to be used by the HTTP client
     * @return {Promise<void>} promise
     */
    async housekeeping(httpAgent) {
        try {
            const { transitionedEnvironments, endedRuns } = await handleLostRunsAndEnvironments(httpAgent);
            const subMessages = [];
            if (transitionedEnvironments.length > 0) {
                subMessages.push(`environments (${transitionedEnvironments.join(', ')})`);
            }
            if (endedRuns.length > 0) {
                subMessages.push(`runs (${endedRuns.join(', ')})`);
            }

            if (subMessages.length > 0) {
                this._logger.debugMessage(`Updated lost ${subMessages.join(' and ')}`);
            }
        } catch (error) {
            this._logger.errorMessage(`Error while handling lost runs & environments: ${error}`);
        }
    }


    /**
     * Begins the process of connecting to the database
     * @returns {Promise<boolean>} returns boolean if connection is successful
     */
    async connectDatabase() {
        let retries = 0;

        try {
            await this.database.connect();
        } catch {
            retries++;
            setTimeout(() => {
                this.connectDatabase();
            }, retries * 1000);
        }

        try {
            if (isInTestMode()) {
                await this.database.dropAllTables();
            }

            await this.database.migrate();

            if (isInTestMode()) {
                await this.database.seed();
            }

            return true;
        } catch (error) {
            this._logger.errorMessage(`Error while starting: ${error}`);
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

    async _getHttpAgent() {
        const pfxCertificateBytes = await fs.readFile(userCertificate.path);
        const certificatePassphrase = userCertificate.passphrase;

        return pfxCertificateBytes && certificatePassphrase
            ? new https.Agent({ pfx: pfxCertificateBytes, passphrase: certificatePassphrase })
            : undefined;
    }
}

module.exports = new BookkeepingApplication();
