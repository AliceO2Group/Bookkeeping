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

const sampleDataPass = {
    name: 'LHC22g_npass1',
    reconstructedEventsCount: 834213929,
    description: 'd PASS random f f random data data',
    outputSize: 93862653102692,
    lastRunNumber: 505946,
};

module.exports = () => {
    it('Should get data with respect to given year limit (2022) and in correct format', async () => {
        const monalisaInterface = getMockMonalisaInterface(2022);
        const dataPasses = await monalisaInterface.getDataPasses();
        expect(dataPasses).to.be.an('array');
        expect(dataPasses).to.be.lengthOf(79);
        dataPasses.forEach((dataPass) => expect(Object.keys(dataPass)).to.has.all.members(Object.keys(sampleDataPass)));
        dataPasses.forEach((dataPass) => expect(Object.values(dataPass).map((value) => typeof value))
            .to.has.all.members(Object.values(sampleDataPass).map((value) => typeof value)));
    });

    it('Should get data with respect to given year limit (2023) and in correct format', async () => {
        const monalisaInterface = getMockMonalisaInterface(2023);
        const dataPasses = await monalisaInterface.getDataPasses();
        expect(dataPasses).to.be.an('array');
        expect(dataPasses).to.be.lengthOf(24);
        dataPasses.forEach((dataPass) => expect(Object.keys(dataPass)).to.has.all.members(Object.keys(sampleDataPass)));
        dataPasses.forEach((dataPass) => expect(Object.values(dataPass).map((value) => typeof value))
            .to.has.all.members(Object.values(sampleDataPass).map((value) => typeof value)));
    });
};
