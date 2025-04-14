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
            await Promise.all([
                await this.startWebServer(),
                await this.startGrpcServers(),

                await this.startDatabaseConnexion(),

                await this.startAliEcsSynchronization(),
                await this.startCcdbSynchronization(),
                await this.startMonalisaSynchronization(),

                await this.startHousekeeping(),
            ]);
        } catch (error) {
            this._logger.errorMessage(`Error while starting: ${error}`);
            return this.stop();
        }

        this._logger.infoMessage('Started');
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
     * Start the web server
     *
     * @return {Promise<void>} resolves once the server is started
     */
    async startWebServer() {
        await this.webUiServer.listen();
    }

    /**
     * Start the gRPC servers, if any
     *
     * @return {Promise<void>} resolves once the servers are started
     */
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

    /**
     * Start the connection to database and run migrations if needed
     *
     * @return {Promise<void>} resolves once the database connexion is ready
     */
    async startDatabaseConnexion() {
        await this.database.connect();

        if (isInTestMode()) {
            await this.database.dropAllTables();
        }

        await this.database.migrate();

        if (isInTestMode()) {
            await this.database.seed();
        }
    }

    /**
     * Starts the synchronization with AlieECS
     *
     * @return {Promise<void>} resolves once the synchronization has started
     */
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

    /**
     * Starts the synchronization with CCDB
     *
     * @return {Promise<void>} resolves once the synchronization has started
     */
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

    /**
     * Starts the synchronization with Monalisa
     *
     * @return {Promise<void>} resolves once the synchronization has started
     */
    async startMonalisaSynchronization() {
        if (monalisaConfig.enableSynchronization) {
            const monAlisaSynchronizer = new MonAlisaSynchronizer(new MonAlisaClient({
                dataPassesUrl: monalisaConfig.dataPassesUrl,
                dataPassDetailsUrl: monalisaConfig.dataPassDetailsUrl,
                simulationPassesUrl: monalisaConfig.simulationPassesUrl,
                yearLowerLimit: monalisaConfig.dataPassesYearLowerLimit,
                agent: await this._getExternalServicesHttpAgent(),
            }));

            this.scheduledProcessesManager.schedule(
                () => monAlisaSynchronizer.synchronize(),
                {
                    wait: 10 * 1000,
                    every: monalisaConfig.synchronizationPeriod,
                },
            );
        }
    }

    /**
     * Starts housekeeping scheduled processes if any (handle of lost runs and environments)
     *
     * @return {Promise<void>} Resolves once the processes are scheduled
     */
    async startHousekeeping() {
        if (enableHousekeeping) {
            const agent = await this._getExternalServicesHttpAgent();
            this.scheduledProcessesManager.schedule(
                () => handleLostRunsAndEnvironments(agent),
                {
                    wait: 30 * 1000,
                    every: 30 * 1000,
                },
            );
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

    /**
     * Returns the HTTP agent to use to connect to external services
     *
     * @return {Promise<module:https.Agent|null>} the resulting agent or null if none should be used
     * @private
     */
    async _getExternalServicesHttpAgent() {
        if (this._externalServicesHttpAgent === undefined) {
            const pfxCertificateBytes = await fs.readFile(userCertificate.path);
            const certificatePassphrase = userCertificate.passphrase;

            this._externalServicesHttpAgent = pfxCertificateBytes && certificatePassphrase
                ? new https.Agent({ pfx: pfxCertificateBytes, passphrase: certificatePassphrase })
                : null;
        }
        return this._externalServicesHttpAgent;
    }
}

module.exports = new BookkeepingApplication();
