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

const { MonALISAInterface } = require('../../../../../lib/server/monalisa-synchronization/MonALISAInterface.js');

const mockDataPasses = require('./mockDataPasses.json');
const mockDescriptionToDataPassDetails = require('./mockDescriptionToDataPassDetails.json');

exports.getMockMonALISAInterface = (yearLowerLimit) => {
    if (!yearLowerLimit) {
        throw new Error('Year limit not specified');
    }
    const instance = new MonALISAInterface({
        dataPassesUrl: 'https://some.mock.url.com',
        dataPassDetailsUrl: 'https://some.other.mock.url.com',
        yearLowerLimit,
    });
    instance.fetchDataPasses = async () => mockDataPasses;
    instance.fetchDataPassDetails = async (description) => mockDescriptionToDataPassDetails[description];
    return instance;
};
