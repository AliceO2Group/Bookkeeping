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
const { getMockMonALISAClient } = require('./data/getMockMonALISAClient.js');
const { MonALISASynchronizer } = require('../../../../lib/server/monalisa-synchronization/MonALISASynchronizer.js');
const { repositories: { DataPassRepository, LhcPeriodRepository, SimulationPassRepository } } = require('../../../../lib/database');

const { extractLhcPeriod } = require('../../../../lib/server/utilities/extractLhcPeriod');
const { resetDatabaseContent } = require('../../../utilities/resetDatabaseContent.js');

const YEAR_LOWER_LIMIT = 2023;

module.exports = () => {
    after(async () => resetDatabaseContent());

    it('Should synchronize Data Passes with respect to given year limit and in correct format', async () => {
        const monALISAClient = getMockMonALISAClient(YEAR_LOWER_LIMIT);
        const mockDataPasses = await monALISAClient.getDataPasses();
        const monALISASynchronizer = new MonALISASynchronizer(monALISAClient);
        const expectedDataPasses = mockDataPasses.filter(({ name }) => extractLhcPeriod(name).year >= YEAR_LOWER_LIMIT);

        // Run Synchronization
        await monALISASynchronizer.synchronizeDataPassesFromMonALISA();

        const dataPassesDB = await DataPassRepository.findAll({ include: { association: 'runs', attributes: ['runNumber'] } });

        // Correct amount of data
        expect(dataPassesDB).to.be.an('array');
        expect(dataPassesDB).to.be.lengthOf(8);

        // All expected data passes names present
        const expectedNames = expectedDataPasses.map(({ name }) => name);
        expect(dataPassesDB.map(({ name }) => name)).to.include.all.members(expectedNames);

        // All associated with appripriate LHC Periods
        const lhcPeriodNameToId = Object.fromEntries(await LhcPeriodRepository.findAll({
            raw: true,
            attributes: ['id', 'name'],
        }).map(({ id, name }) => [name, id]));

        expect(dataPassesDB.map(({ name, lhcPeriodId }) => lhcPeriodNameToId[name.split('_')[0]] === lhcPeriodId).every((I) => I)).to.be.true;

        // Properties of data passes are the same
        expect(dataPassesDB.map((dataPass) => {
            const { name, outputSize, description, reconstructedEventsCount, lastRunNumber } = dataPass;
            return { name, outputSize, description, reconstructedEventsCount, lastRunNumber };
        })).to.include.deep.all.members(expectedDataPasses);

        // Data Pass details are in DB
        const expectedDataPassesNamesSet = new Set(expectedNames);
        for (const dataPass of dataPassesDB) {
            if (expectedDataPassesNamesSet.has(dataPass.name)) {
                const { description, runs } = dataPass;
                const { runNumbers: expectedRunNumbers } = await monALISAClient.getDataPassDetails(description);
                expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRunNumbers);
            }
        }
    });

    it('Should synchronize Simulation Passes with respect to given year limit and in correct format', async () => {
        const monALISAClient = getMockMonALISAClient(YEAR_LOWER_LIMIT);
        const expectedSimulationPasses = await monALISAClient.getSimulationPasses();
        const nameToSimulationPass = Object.fromEntries(expectedSimulationPasses
            .map((simulationPass) => [simulationPass.properties.name, simulationPass]));
        const monALISASynchronizer = new MonALISASynchronizer(monALISAClient);

        // Run Synchronization
        await monALISASynchronizer.synchronizeSimulationPassesFromMonALISA();

        const simulationPassesDB = await SimulationPassRepository.findAll({
            include: [
                { association: 'runs', attributes: ['runNumber'] },
                { association: 'dataPass', attributes: ['id', 'name'] },
            ],
        });

        // Correct amount of data
        expect(simulationPassesDB).to.be.an('array');
        expect(simulationPassesDB).to.be.lengthOf(2);

        // All expected Simulation Passes names present
        const expectedSimulationPassesNames = expectedSimulationPasses.map(({ properties: { name } }) => name);
        expect(simulationPassesDB.map(({ name }) => name)).to.include.all.members(expectedSimulationPassesNames);

        // Properties of Simulation Passes are the same
        expect(simulationPassesDB.map((simulationPass) => {
            const { name, jiraId, description, pwg, requestedEventsCount, generatedEventsCount, outputSize } = simulationPass;
            return { name, jiraId, description, pwg, requestedEventsCount, generatedEventsCount, outputSize };
        })).to.include.deep.all.members(expectedSimulationPasses.map(({ properties }) => properties));

        // All associated with appropriate Data Passes
        expect(simulationPassesDB.map(({ name }) =>
            ({ name,
                dataPasses:
                nameToSimulationPass[name].associations.lhcPeriods
                    .flatMap((lhcPeriod) => nameToSimulationPass[name].associations.dataPassesSuffixes
                        .map((suffix) => `${lhcPeriod}_${suffix}`)) })))

            .to.have.deep.all.members(simulationPassesDB.map(({ name, dataPass }) => ({ name, dataPasses: dataPass.map(({ name }) => name) })));

        // Runs of Simulation Pass are in DB
        for (const simulationPassDB of simulationPassesDB) {
            const { name, runs } = simulationPassDB;
            expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(nameToSimulationPass[name].associations.runNumbers);
        }
    });
};
