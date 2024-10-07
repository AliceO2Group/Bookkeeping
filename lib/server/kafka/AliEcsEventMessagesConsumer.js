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
const { KafkaMessagesConsumer } = require('./KafkaMessagesConsumer.js');

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
class AliEcsEventMessagesConsumer extends KafkaMessagesConsumer {
    // eslint-disable-next-line valid-jsdoc
    /**
     * Constructor
     *
     * @param {import('kafkajs').Kafka} kafkaClient configured kafka client
     * @param {string} groupId the group id to use for the kafka consumer
     * @param {string[]} topics the list of topics to consume
     */
    constructor(kafkaClient, groupId, topics) {
        super(kafkaClient, groupId, topics, EventMessage);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    getLoggerLabel() {
        return 'ALI-ECS-EVENT-CONSUMER';
    }
}

exports.AliEcsEventMessagesConsumer = AliEcsEventMessagesConsumer;
