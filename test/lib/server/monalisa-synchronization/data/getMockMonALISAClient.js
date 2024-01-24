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

const { MonALISAClient } = require('../../../../../lib/server/monalisa-synchronization/MonALISAClient.js');

const mockDataPasses = require('./mockDataPasses.json');
const mockDescriptionToDataPassDetails = require('./mockDescriptionToDataPassDetails.json');
const mockSimulationPasses = require('./mockSimulationPasses.json');

exports.getMockMonALISAClient = (yearLowerLimit) => {
    if (!yearLowerLimit) {
        throw new Error('Year limit not specified');
    }
    const instance = new MonALISAClient({
        dataPassesUrl: 'https://some.mock.url.com',
        dataPassDetailsUrl: 'https://some.other.mock.url.com',
        yearLowerLimit,
    });
    instance._fetchDataPasses = async () => mockDataPasses;
    instance._fetchDataPassDetails = async (description) => mockDescriptionToDataPassDetails[description];
    instance._fetchSimulationPasses = async () => mockSimulationPasses;
    return instance;
};
