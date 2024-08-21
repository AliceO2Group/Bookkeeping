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

// Default configuration
const brokers = process.env?.KAFKA_BROKER ? [process.env.KAFKA_BROKER] : null;
const consumeEcsMessages = process.env?.CONSUME_ECS_MESSAGES?.toLowerCase() === 'true';

module.exports = {
    brokers,
    consumeEcsMessages,
};
