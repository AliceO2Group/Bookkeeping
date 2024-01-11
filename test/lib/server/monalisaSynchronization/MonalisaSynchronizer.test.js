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
const { repositories: { DataPassRepository, LhcPeriodRepository } } = require('../../../../lib/database');

const { extractLhcPeriod } = require('../../../../lib/server/utilities/extractLhcPeriod');

const YEAR_LOWER_LIMIT = 2023;

module.exports = () => {
    it('Should get data with respect to given year limit and in correct format', async () => {
        const monalisaInterface = getMockMonalisaInterface(YEAR_LOWER_LIMIT);
        const mockDataPasses = await monalisaInterface.getDataPasses();
        monalisaSynchronizer.monalisaInterface = monalisaInterface;
        const expectedDataPasses = mockDataPasses.filter(({ name }) => extractLhcPeriod(name).year >= YEAR_LOWER_LIMIT);

        // Run Synchronization
        await monalisaSynchronizer.synchronizeDataPassesFromMonalisa();

        const dataPassesDB = await DataPassRepository.findAll({ raw: true });

        // Correct amount of data
        expect(dataPassesDB).to.be.an('array');
        expect(dataPassesDB).to.be.lengthOf(24);

        // All expected data passes names present
        const expectedNames = expectedDataPasses.map(({ name }) => name);
        expect(dataPassesDB.map(({ name }) => name)).to.have.all.members(expectedNames);

        // All associated with appripriate LHC Periods
        const lhcPeriodNameToId = Object.fromEntries((await LhcPeriodRepository.findAll({ raw: true, attributes: ['id', 'name'] }))
            .map(({ id, name }) => [name, id]));

        expect(dataPassesDB.map(({ name, lhcPeriodId }) => lhcPeriodNameToId[name.split('_')[0]] === lhcPeriodId).every((I) => I)).to.be.true;

        // Properties of data passes are the same
        expect(expectedDataPasses).to.has.deep.all.members(dataPassesDB.map((dataPass) => {
            const { name, outputSize, description, reconstructedEventsCount, lastRunNumber } = dataPass;
            return { name, outputSize, description, reconstructedEventsCount, lastRunNumber };
        }));
    });
};
