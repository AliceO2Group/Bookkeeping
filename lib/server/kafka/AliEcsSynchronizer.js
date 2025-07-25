/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { LogManager, AliEcsEventMessagesConsumer } = require('@aliceo2/web-ui');
const { longToBigInt } = require('../utilities/bigIntConverter.js');
const { isAnEmptyShell } = require('../utilities/isAnEmptyShell.js');

const ENVIRONMENT_CONSUMER_GROUP = 'bookkeeping-environment';
const ENVIRONMENT_TOPICS = ['aliecs.environment'];

const RUN_CONSUMER_GROUP = 'bookkeeping-run';
const RUN_TOPICS = ['aliecs.run'];

const TRIGGER_INTEGRATE_SERVICE_CONSUMER_GROUP = 'bookkeeping-trigger-integrated-service';
const TRIGGER_INTEGRATE_SERVICE_TOPICS = ['aliecs.integrated_service.trg'];

/**
 * Utility synchronizing AliECS data into bookkeeping, listening to kafka
 */
class AliEcsSynchronizer {
    /**
     * Constructor
     *
     * @param {object} services services instances
     * @param {import('kafkajs').Kafka} services.kafkaClient configured kafka client
     * @param {EnvironmentService} services.environmentService instance of EnvironmentService
     * @param {RunService} services.runService instance of RunService
     */
    constructor(services) {
        const { kafkaClient, environmentService, runService } = services;
        this._logger = LogManager.getLogger('ALI-ECS-SYNCHRONIZER');

        this.ecsEnvironmentsConsumer = new AliEcsEventMessagesConsumer(kafkaClient, ENVIRONMENT_CONSUMER_GROUP, ENVIRONMENT_TOPICS);
        this.ecsEnvironmentsConsumer.onMessageReceived(async (eventMessage) => {
            const { timestampNano, environmentEvent: { environmentId, state, message, vars = {} } } = eventMessage;

            const bigIntTimestamp = longToBigInt(timestampNano);
            const millisecondsTimestamp = Number(bigIntTimestamp / BigInt(1e6));
            const nanoSecondsTimestamps = Number(bigIntTimestamp % BigInt(1e9));

            const newState = {
                timestamp: millisecondsTimestamp,
                timestampNano: nanoSecondsTimestamps,
                status: state,
                statusMessage: message,
            };

            if (isAnEmptyShell(vars) || vars.bookkept === 'false') {
                // We do not know if the environment should be kept or not, update it if it exists, but do not create it
                try {
                    await environmentService.update(environmentId, {}, newState);
                } catch {
                    this._logger.debugMessage('Received message for non-existing environment with empty vars or bookkept false, ignoring it');
                }
            } else {
                // Vars contains value, either `bookkept` is present and is true, either it is not there (old workflows) and we consider it true
                await environmentService.createOrUpdateEnvironment(environmentId, newState, vars);
            }
        });

        this.ecsRunConsumer = new AliEcsEventMessagesConsumer(kafkaClient, RUN_CONSUMER_GROUP, RUN_TOPICS);
        this.ecsRunConsumer.onMessageReceived(async (eventMessage) => {
            const { timestamp, runEvent: { environmentId, runNumber, transition, lastRequestUser } } = eventMessage;
            const { externalId: externalUserId, name: userName } = lastRequestUser ?? {};

            if (transition === 'START_ACTIVITY') {
                runService
                    .createOrUpdate(
                        runNumber,
                        environmentId,
                        { timeO2Start: timestamp.toNumber() },
                        { userO2Start: { userIdentifier: { externalUserId }, name: userName } },
                    )
                    .catch((error) => this._logger.errorMessage(`Failed to save run start for ${runNumber}: ${error.message}`));
            }

            if (transition === 'STOP_ACTIVITY' || transition === 'GO_ERROR') {
                runService
                    .createOrUpdate(
                        runNumber,
                        environmentId,
                        { timeO2End: timestamp.toNumber() },
                        { userO2Stop: { userIdentifier: { externalUserId }, name: userName } },
                    )
                    .catch((error) => this._logger.errorMessage(`Failed to save run end for ${runNumber}: ${error.message}`));
            }
        });

        this.ecsTrgIntegratedServiceConsumer = new AliEcsEventMessagesConsumer(
            kafkaClient,
            TRIGGER_INTEGRATE_SERVICE_CONSUMER_GROUP,
            TRIGGER_INTEGRATE_SERVICE_TOPICS,
        );
        this.ecsTrgIntegratedServiceConsumer.onMessageReceived(async (eventMessage) => {
            const { timestamp, integratedServiceEvent: { environmentId, operationName, operationStepStatus, payload } } = eventMessage;
            const { trgRequest: { runn: runNumber } } = JSON.parse(payload);

            if (operationName === 'trg.RunStart()' && operationStepStatus === 'DONE_OK') {
                await runService.createOrUpdate(runNumber, environmentId, { timeTrgStart: timestamp.toNumber() });
            } else if (operationStepStatus === 'DONE_OK'
                && (operationName === 'trg.RunStop()' || operationName === 'trg.EnsureRunStop()')
            ) {
                await runService.createOrUpdate(runNumber, environmentId, { timeTrgEnd: timestamp.toNumber() });
            }
        });
    }

    /**
     * Start the synchronization process
     *
     * @return {void}
     */
    start() {
        this._logger.infoMessage('Starting to consume AliECS messages');
        this.ecsEnvironmentsConsumer.start()
            .catch((error) => this._logger
                .errorMessage(`Error when starting ECS environment consumer: ${error.message}\n${JSON.stringify(error)}`));

        this.ecsRunConsumer.start()
            .catch((error) => this._logger.errorMessage(`Error when starting ECS runs consumer: ${error.message}\n${JSON.stringify(error)}`));

        this.ecsTrgIntegratedServiceConsumer.start()
            .catch((error) => this._logger
                .errorMessage(`Error when starting ECS trigger integrated service consumer: ${error.message}\n${JSON.stringify(error)}`));
    }
}

exports.AliEcsSynchronizer = AliEcsSynchronizer;
