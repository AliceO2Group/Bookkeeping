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

const { expect } = require('chai');
const { getMockMonalisaInterface } = require('./data/getMockMonalisaInterface');
const { monalisaSynchronizer } = require('../../../../lib/server/monalisaSynchronization/MonalisaSynchronizer');
const { repositories: { DataPassRepository } } = require('../../../../lib/database');

const mockDataPasses = require('./data/mockDataPasses.json');

module.exports = () => {
    it('Should get data with respect to given year limit and in correct format', async () => {
        monalisaSynchronizer.monalisaInterface = getMockMonalisaInterface(2022);
        await monalisaSynchronizer.synchronizeDataPassesFromMonalisa();

        const dataPasses = DataPassRepository.findAll({ raw: true });
        
    });
};
