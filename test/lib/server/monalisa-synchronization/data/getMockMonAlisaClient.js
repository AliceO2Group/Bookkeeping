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

const { MonAlisaClient } = require('../../../../../lib/server/monalisa-synchronization/MonAlisaClient.js');
const fs = require('fs');

const mockDataPasses = String(fs.readFileSync('./test/lib/server/monalisa-synchronization/data/mockDataPasses.txt'));
const mockDescriptionToDataPassVersionDetails = require('./mockDescriptionToDataPassVersionDetails.json');
const mockSimulationPasses = require('./mockSimulationPasses.json');

exports.getMockMonAlisaClient = (yearLowerLimit) => {
    if (!yearLowerLimit) {
        throw new Error('Year limit not specified');
    }
    const instance = new MonAlisaClient({
        dataPassesUrl: 'https://some.mock.url.com',
        dataPassDetailsUrl: 'https://some.other.mock.url.com',
        yearLowerLimit,
    });
    instance._fetchDataPassesVersions = async () => mockDataPasses;
    instance._fetchDataPassVersionDetails = async (description) => mockDescriptionToDataPassVersionDetails[description];
    instance._fetchSimulationPasses = async () => mockSimulationPasses;
    return instance;
};
