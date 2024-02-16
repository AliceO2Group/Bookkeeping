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
const { getMockMonAlisaClient } = require('./data/getMockMonAlisaClient.js');
const { MonAlisaSynchronizer } = require('../../../../lib/server/monalisa-synchronization/MonAlisaSynchronizer.js');
const { repositories:
    { DataPassRepository, LhcPeriodRepository, SimulationPassRepository, RunRepository } } = require('../../../../lib/database/index.js');
const { extractLhcPeriod } = require('../../../../lib/server/utilities/extractLhcPeriod.js');
const { resetDatabaseContent } = require('../../../utilities/resetDatabaseContent.js');
const { RunDefinition } = require('../../../../lib/server/services/run/getRunDefinition.js');
const { Op } = require('sequelize');

const YEAR_LOWER_LIMIT = 2023;

module.exports = () => {
    after(async () => resetDatabaseContent());

    it('Should synchronize Data Passes with respect to given year limit and in correct format', async () => {
        const monAlisaClient = getMockMonAlisaClient(YEAR_LOWER_LIMIT);
        const mockDataPasses = await monAlisaClient.getDataPasses();
        const monAlisaSynchronizer = new MonAlisaSynchronizer(monAlisaClient);
        const expectedDataPasses = mockDataPasses.filter(({ name }) => extractLhcPeriod(name).year >= YEAR_LOWER_LIMIT);

        // Check whether examining data passes with last runs works correctly;
        let lastRunNumbers = await monAlisaSynchronizer._getAllDataPassesLastRunNumber();
        expect(mockDataPasses.every((dataPass) => monAlisaSynchronizer._doesDataPassNeedUpdate(dataPass, lastRunNumbers))).to.be.true;

        // Run Synchronization
        await monAlisaSynchronizer._synchronizeDataPassesFromMonAlisa();

        const dataPassesDB = await DataPassRepository.findAll({ include: { association: 'runs', attributes: ['runNumber'] } });

        // Correct amount of data
        expect(dataPassesDB).to.be.an('array');
        expect(dataPassesDB).to.be.lengthOf(8);

        // All expected data passes names present
        const expectedNames = expectedDataPasses.map(({ name }) => name);
        expect(dataPassesDB.map(({ name }) => name)).to.include.all.members(expectedNames);

        // All associated with appripriate LHC Periods
        const lhcPeriodNameToId = Object.fromEntries((await LhcPeriodRepository.findAll({
            raw: true,
            attributes: ['id', 'name'],
        })).map(({ id, name }) => [name, id]));

        expect(dataPassesDB.map(({ name, lhcPeriodId }) => lhcPeriodNameToId[name.split('_')[0]] === lhcPeriodId).every((I) => I)).to.be.true;

        // Properties of data passes are the same
        expect(dataPassesDB.map((dataPass) => {
            const { name, outputSize, description, reconstructedEventsCount, lastRunNumber } = dataPass;
            return { name, outputSize, description, reconstructedEventsCount, lastRunNumber };
        })).to.include.deep.all.members(expectedDataPasses);

        // Data Pass details are in DB (runs are associated)
        const expectedDataPassesNamesSet = new Set(expectedNames);
        for (const dataPass of dataPassesDB) {
            if (expectedDataPassesNamesSet.has(dataPass.name)) {
                const { description, runs } = dataPass;
                const { runNumbers: potentiallyExpectedRunNumbers } = await monAlisaClient.getDataPassDetails(description);
                const expectedRunNumbers = (await RunRepository.findAll({ where: {
                    runNumber: { [Op.in]: potentiallyExpectedRunNumbers },
                    definition: RunDefinition.Physics,
                } })).map(({ runNumber }) => runNumber);

                console.log(expectedRunNumbers, dataPass.name, 'TOBEC');
                expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRunNumbers);
            }
        }

        // Check whether examining data passes with last runs works correctly;
        lastRunNumbers = await monAlisaSynchronizer._getAllDataPassesLastRunNumber();
        expect(mockDataPasses.some((dataPass) => !monAlisaSynchronizer._doesDataPassNeedUpdate(dataPass, lastRunNumbers))).to.be.true;
    });

    it('Should synchronize Simulation Passes with respect to given year limit and in correct format', async () => {
        const monAlisaClient = getMockMonAlisaClient(YEAR_LOWER_LIMIT);
        const potentiallyInsertedSimulationPasses = await monAlisaClient.getSimulationPasses();
        expect(potentiallyInsertedSimulationPasses).to.be.length.greaterThan(0);
        const nameToSimulationPass = Object.fromEntries(potentiallyInsertedSimulationPasses
            .map((simulationPass) => [simulationPass.properties.name, simulationPass]));
        const monAlisaSynchronizer = new MonAlisaSynchronizer(monAlisaClient);

        // Run Synchronization
        await monAlisaSynchronizer._synchronizeSimulationPassesFromMonAlisa();

        const simulationPassesDB = await SimulationPassRepository.findAll({
            include: [
                { association: 'runs', attributes: ['runNumber'] },
                { association: 'dataPasses', attributes: ['id', 'name'] },
            ],
        });

        // Correct amount of data
        expect(simulationPassesDB).to.be.an('array');
        expect(simulationPassesDB).to.be.lengthOf(2);

        // All expected Simulation Passes names present
        const potentiallyInsertedSimulationPassesNames = potentiallyInsertedSimulationPasses.map(({ properties: { name } }) => name);
        expect(simulationPassesDB.map(({ name }) => name)).to.include.all.members(potentiallyInsertedSimulationPassesNames);

        // Properties of Simulation Passes are the same
        expect(simulationPassesDB.map((simulationPass) => {
            const { name, jiraId, description, pwg, requestedEventsCount, generatedEventsCount, outputSize } = simulationPass;
            return { name, jiraId, description, pwg, requestedEventsCount, generatedEventsCount, outputSize };
        })).to.include.deep.all.members(potentiallyInsertedSimulationPasses.map(({ properties }) => properties));

        const potentiallyInsertedNamesSet = new Set(potentiallyInsertedSimulationPassesNames);

        // All associated with appropriate Data Passes

        // eslint-disable-next-line require-jsdoc
        const helperGetDataPassNamesPerLhcPeriodOfSimulationPass = (name, lhcPeriod) =>
            nameToSimulationPass[name].associations.dataPassesSuffixes.map((suffix) => `${lhcPeriod}_${suffix}`);
        // eslint-disable-next-line require-jsdoc
        const helperGetDataPassNamesPerSimulationPassName = (name) =>
            nameToSimulationPass[name]?.associations.lhcPeriods
                .flatMap((lhcPeriod) => helperGetDataPassNamesPerLhcPeriodOfSimulationPass(name, lhcPeriod));

        const simulationPassToDataPassNames = simulationPassesDB
            .filter(({ name }) => potentiallyInsertedNamesSet.has(name))
            .map(({ name }) => ({ name, dataPasses: helperGetDataPassNamesPerSimulationPassName(name) }));

        expect(simulationPassesDB.map(({ name, dataPasses }) => ({ name, dataPasses: dataPasses.map(({ name }) => name) })))
            .to.include.deep.all.members(simulationPassToDataPassNames);

        // Runs of Simulation Pass are in DB
        for (const simulationPassDB of simulationPassesDB) {
            const { name, runs } = simulationPassDB;
            if (potentiallyInsertedNamesSet.has(name)) {
                const expectedRunNumbers = (await RunRepository.findAll({ where: {
                    runNumber: { [Op.in]: nameToSimulationPass[name].associations.runNumbers },
                    definition: RunDefinition.Physics,
                } })).map(({ runNumber }) => runNumber);

                expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRunNumbers);
            }
        }
    });
};
