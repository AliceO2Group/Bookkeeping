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

const { LogManager } = require('@aliceo2/web-ui');
const { logLevel } = require('kafkajs');

/**
 * Kafka log creator to send messages to infologger
 *
 * @return {function} log creator ready to be used for infologger
 * @constructor
 */
exports.InfologgerKafkaLogCreator = () => {
    const logger = LogManager.getLogger('KAFKA');
    return ({ level, log }) => {
        const { broker, message, stack } = log;
        let logMessage = '';
        if (broker) {
            logMessage = `Broker ${broker} - `;
        }
        logMessage += message;
        if (stack) {
            logMessage += `\n${stack}`;
        }

        switch (level) {
            case logLevel.ERROR:
            case logLevel.NOTHING:
                logger.errorMessage(logMessage);
                break;
            case logLevel.WARN:
                logger.warnMessage(logMessage);
                break;
            case logLevel.INFO:
                logger.infoMessage(logMessage);
                break;
            default:
                logger.debugMessage(logMessage);
                break;
        }
    };
};
