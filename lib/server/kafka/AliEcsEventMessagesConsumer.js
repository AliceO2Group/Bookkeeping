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
const protobuf = require('protobufjs');
const path = require('node:path');
const { LogManager } = require('@aliceo2/web-ui');

const protoDir = path.resolve(__dirname, '../../../proto/ecs');
const root = protobuf.loadSync(path.resolve(protoDir, 'events.proto'));
const EventMessage = root.lookupType('events.Event');

/**
 * @callback MessageReceivedCallback
 * @param {EventMessage} message received message
 * @return {Promise<void>}
 */

/**
 * Consumer that consume ECS event messages and pass them to previously-registered listeners
 */
class AliEcsEventMessagesConsumer {
    // eslint-disable-next-line valid-jsdoc
    /**
     * Constructor
     *
     * @param {import('kafkajs').Kafka} kafkaClient configured kafka client
     * @param {string} groupId the group id to use for the kafka consumer
     * @param {string[]} topics the list of topics to consume
     */
    constructor(kafkaClient, groupId, topics) {
        this.consumer = kafkaClient.consumer({ groupId });
        this._topics = topics;

        /**
         * @type {MessageReceivedCallback[]}
         * @private
         */
        this._listeners = [];

        this._logger = LogManager.getLogger('ALI-ECS-EVENT-CONSUMER');
    }

    /**
     * Register a listener to listen on event message being received
     *
     * Listeners are called all at once, not waiting for completion before calling the next ones, only errors are caught and logged
     *
     * @param {MessageReceivedCallback} listener the listener to register
     * @return {void}
     */
    onMessageReceived(listener) {
        this._listeners.push(listener);
    }

    /**
     * Start the kafka consumer
     *
     * @return {Promise<void>} Resolves once the consumer started to consume messages
     */
    async start() {
        this._logger.infoMessage(`Started to listen on kafka topic ${this._topics}`);
        await this.consumer.connect();
        await this.consumer.subscribe({ topics: this._topics });
        await this.consumer.run({
            eachMessage: async ({ message, topic }) => {
                const error = EventMessage.verify(message.value);
                if (error) {
                    this._logger.errorMessage(`Received an invalid message on "${topic}" ${error}`);
                    return;
                }
                this._logger.debugMessage(`Received message on ${topic}`);

                try {
                    await this._handleEvent(EventMessage.toObject(
                        EventMessage.decode(message.value),
                        { enums: String },
                    ));
                } catch (error) {
                    this._logger.errorMessage(`Failed to convert message to object on topic ${topic}: ${error}`);
                }
            },
        });
    }

    /**
     * Call every registered listeners by passing the given message to it
     *
     * @param {EventMessage} message the message to pass to listeners
     * @return {void}
     */
    async _handleEvent(message) {
        for (const listener of this._listeners) {
            try {
                await listener(message);
            } catch (error) {
                this._logger.errorMessage(`An error occurred when handling event: ${error.message}\n${error.stack}`);
            }
        }
    }
}

exports.AliEcsEventMessagesConsumer = AliEcsEventMessagesConsumer;
