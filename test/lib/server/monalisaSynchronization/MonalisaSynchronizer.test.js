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
const { getMockMonALISAInterface } = require('./data/getMockMonALISAInterface.js');
const { monALISASynchronizer } = require('../../../../lib/server/MonALISASynchronization/MonALISASynchronizer.js');
const { repositories: { DataPassRepository, LhcPeriodRepository } } = require('../../../../lib/database');
const { dataSource } = require('../../../../lib/database/DataSource.js');

const { extractLhcPeriod } = require('../../../../lib/server/utilities/extractLhcPeriod');

const YEAR_LOWER_LIMIT = 2023;

module.exports = () => {
    it('Should get data with respect to given year limit and in correct format', async () => {
        const monALISAInterface = getMockMonALISAInterface(YEAR_LOWER_LIMIT);
        const mockDataPasses = await monALISAInterface.getDataPasses();
        monALISASynchronizer.monALISAInterface = monALISAInterface;
        const expectedDataPasses = mockDataPasses.filter(({ name }) => extractLhcPeriod(name).year >= YEAR_LOWER_LIMIT);

        // Run Synchronization
        await monALISASynchronizer.synchronizeDataPassesFromMonALISA();

        const dataPassesDB = await DataPassRepository.findAll(dataSource
            .createQueryBuilder()
            .include({ association: 'runs', attributes: ['runNumber'] }));

        // Correct amount of data
        expect(dataPassesDB).to.be.an('array');
        expect(dataPassesDB).to.be.lengthOf(24);

        // All expected data passes names present
        const expectedNames = expectedDataPasses.map(({ name }) => name);
        expect(dataPassesDB.map(({ name }) => name)).to.have.all.members(expectedNames);

        // All associated with appripriate LHC Periods
        const lhcPeriodNameToId = Object.fromEntries((await LhcPeriodRepository.findAll(dataSource
            .createQueryBuilder()
            .set('raw', true)
            .set('attributes', ['id', 'name']))
        )
            .map(({ id, name }) => [name, id]));

        expect(dataPassesDB.map(({ name, lhcPeriodId }) => lhcPeriodNameToId[name.split('_')[0]] === lhcPeriodId).every((I) => I)).to.be.true;

        // Properties of data passes are the same
        expect(expectedDataPasses).to.has.deep.all.members(dataPassesDB.map((dataPass) => {
            const { name, outputSize, description, reconstructedEventsCount, lastRunNumber } = dataPass;
            return { name, outputSize, description, reconstructedEventsCount, lastRunNumber };
        }));

        // Data Pass details are in DB
        for (const dataPass of dataPassesDB) {
            const { description, runs } = dataPass;
            const { runNumbers: expectedRunNumbers } = await monALISAInterface.getDataPassDetails(description);
            expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRunNumbers);
        }
    });
};
