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
const { MonAlisaSynchronizer } = require('../../../../../lib/server/externalServicesSynchronization/monalisa/MonAlisaSynchronizer.js');
const {
    repositories: {
        DataPassRepository,
        LhcPeriodRepository,
        SimulationPassRepository,
        RunRepository,
        DataPassVersionRepository,
    },
} = require('../../../../../lib/database/index.js');
const { extractLhcPeriod } = require('../../../../../lib/server/utilities/extractLhcPeriod.js');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');
const { Op } = require('sequelize');
const { RunDefinition } = require('../../../../../lib/domain/enums/RunDefinition.js');
const { DataPassVersionStatus } = require('../../../../../lib/domain/enums/DataPassVersionStatus.js');
const { SkimmingStage } = require('../../../../../lib/domain/enums/SkimmingStage.js');
const {
    gaqDetectorService,
    DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS,
} = require('../../../../../lib/server/services/gaq/GaqDetectorsService.js');

const YEAR_LOWER_LIMIT = 2023;

module.exports = () => {
    after(async () => resetDatabaseContent());

    it('Should synchronize Data Passes with respect to given year limit and in correct format', async () => {
        const monAlisaClient = getMockMonAlisaClient(YEAR_LOWER_LIMIT);
        const mockDataPassesVersions = await monAlisaClient.getDataPassesVersions();
        const monAlisaSynchronizer = new MonAlisaSynchronizer(monAlisaClient);
        const expectedDataPassesVersions = mockDataPassesVersions.filter(({ name }) => extractLhcPeriod(name).year >= YEAR_LOWER_LIMIT);

        // Check whether examining data passes with last_seen information works correctly;
        let lastSeenAndLastStatus = await monAlisaSynchronizer._getAllDataPassVersionsLastSeenAndIdAndLastStatus();
        expect(mockDataPassesVersions.every((dataPass) => monAlisaSynchronizer._doesDataPassVersionNeedUpdate(dataPass, lastSeenAndLastStatus)))
            .to.be.true;

        // Run Synchronization
        await monAlisaSynchronizer._synchronizeDataPassesFromMonAlisa();

        const dataPassesDB = await DataPassRepository.findAll({
            include: [
                { association: 'runs', attributes: ['runNumber'] },
                { association: 'versions', include: [{ association: 'statusHistory', required: true }] },
            ],
        });

        // Expect correct amount of data
        expect(dataPassesDB).to.be.an('array');
        expect(dataPassesDB).to.be.lengthOf(14);

        // All expected data passes names present
        const expectedNames = expectedDataPassesVersions.map(({ name }) => name);
        expect(dataPassesDB.map(({ name }) => name)).to.include.all.members(expectedNames);

        // All associated with appropriate LHC Periods
        const lhcPeriodNameToId = Object.fromEntries((await LhcPeriodRepository.findAll({
            raw: true,
            attributes: ['id', 'name'],
        })).map(({ id, name }) => [name, id]));

        expect(dataPassesDB.map(({ name, lhcPeriodId }) => lhcPeriodNameToId[name.split('_')[0]] === lhcPeriodId).every((I) => I)).to.be.true;

        // Properties of data passes are the same

        expect(dataPassesDB.map((dataPass) => {
            const { name, versions: [{ outputSize, description, reconstructedEventsCount, lastSeen }] } = dataPass;
            return { name, outputSize, description, reconstructedEventsCount, lastSeen };
        })).to.include.deep.all.members(expectedDataPassesVersions);

        // Data Pass details are in DB (runs are associated)
        const expectedDataPassesNamesSet = new Set(expectedNames);
        for (const dataPass of dataPassesDB) {
            if (expectedDataPassesNamesSet.has(dataPass.name)) {
                const { runs } = dataPass;
                let expectedRunNumbers = [];
                for (const version of dataPass.versions) {
                    const { description } = version;
                    const { runNumbers: potentiallyExpectedRunNumbers } = await monAlisaClient.getDataPassVersionDetails(description);

                    expectedRunNumbers = [
                        ...(await RunRepository.findAll({
                            where: {
                                runNumber: { [Op.in]: potentiallyExpectedRunNumbers },
                                definition: RunDefinition.PHYSICS,
                            },
                        })).map(({ runNumber }) => runNumber),
                        ...expectedRunNumbers,
                    ];
                }

                expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRunNumbers);
            }
        }

        // Default GAQ detectors should be set (PbPb runs)
        const dataPassWithNewRuns = await DataPassRepository.findOne({ where: { name: 'LHC23f_skimming' } });
        const runNumbersWithDefaultGaqDetectors = [54, 56];
        for (const runNumber of runNumbersWithDefaultGaqDetectors) {
            const [runDetectors] = await RunRepository.findAll({
                subQuery: false,
                where: { runNumber },
                include: [{ association: 'detectors', where: { name: { [Op.in]: DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS } } }],
            });
            expect((await gaqDetectorService.getGaqDetectors(dataPassWithNewRuns.id, runNumber)).map(({ name }) => name))
                .to.have.all.members(runDetectors.detectors.map(({ name }) => name));
        }

        // Check skimming
        const lhc23fDataPass = await DataPassRepository.findAll({ where: { lhcPeriodId: 3, skimmingStage: { [Op.not]: null } } });
        expect(lhc23fDataPass.map(({ name, skimmingStage }) => ({ name, skimmingStage }))).to.have.all.deep.members([
            { name: 'LHC23f_skimming', skimmingStage: SkimmingStage.SKIMMING },
            { name: 'LHC23f_apass3_skimmed', skimmingStage: SkimmingStage.SKIMMED },
            { name: 'LHC23f_apass4_skimmed', skimmingStage: SkimmingStage.POST_SKIMMED },
        ]);

        // Check whether examining data passes with last_seen information works correctly;
        lastSeenAndLastStatus = await monAlisaSynchronizer._getAllDataPassVersionsLastSeenAndIdAndLastStatus();
        expect(mockDataPassesVersions.some((dataPass) => !monAlisaSynchronizer._doesDataPassVersionNeedUpdate(dataPass, lastSeenAndLastStatus)))
            .to.be.true;

        const dataPassVersionDeletedFromML = await DataPassVersionRepository.findOne({
            attributes: [],
            include: 'statusHistory',
            where: { description: 'LHC22b skimmed' },
            order: [['statusHistory', 'createdAt', 'ASC']],
        });

        expect(dataPassVersionDeletedFromML.statusHistory.map(({ status }) => status)).to.be.have.all.members([
            DataPassVersionStatus.RUNNING,
            DataPassVersionStatus.DELETED,
        ]);
    });

    it('should successfully restart some data passes', async () => {
        const dataPassVersionsDeletedFromML = (await DataPassVersionRepository.findAll({
            include: [{ association: 'statusHistory' }, { association: 'dataPass' }],
            where: { description: 'LHC22b skimmed' },
            order: [['statusHistory', 'createdAt', 'ASC']],
        })).filter(({ statusHistory }) => statusHistory.slice(-1)[0].status === DataPassVersionStatus.DELETED);

        const yearOfDataPassesExistingBeforeFirstSynchronization = 2022;
        const monAlisaClient = getMockMonAlisaClient(yearOfDataPassesExistingBeforeFirstSynchronization);
        // Override mock fetch method
        const dataPassVersionsToBeRestartedContent = dataPassVersionsDeletedFromML.map(({
            dataPass: { name },
            description,
            lastSeen,
            outputSize,
            reconstructedEventsCount,
        }) => `"${name}";"${description}";;;;;;;;;${reconstructedEventsCount};;;;${lastSeen};;${outputSize}`)
            .join('\n');
        const dataPassVersionsToBeRestartedPayload = `# header\n${dataPassVersionsToBeRestartedContent}`;
        monAlisaClient._fetchDataPassesVersions = async () => dataPassVersionsToBeRestartedPayload;
        const monAlisaSynchronizer = new MonAlisaSynchronizer(monAlisaClient);

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep 1s
        await monAlisaSynchronizer._synchronizeDataPassesFromMonAlisa();

        const restartedDataPassVersion = await DataPassVersionRepository.findOne({
            attributes: [],
            include: 'statusHistory',
            where: { description: 'LHC22b skimmed' },
            order: [['statusHistory', 'createdAt', 'ASC']],
        });

        expect(restartedDataPassVersion.statusHistory.map(({ status }) => status)).to.be.have.all.members([
            DataPassVersionStatus.RUNNING,
            DataPassVersionStatus.DELETED,
            DataPassVersionStatus.RUNNING,
        ]);
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
        expect(simulationPassesDB).to.be.lengthOf(5);

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

        // eslint-disable-next-line jsdoc/require-param
        const helperGetDataPassNamesPerLhcPeriodOfSimulationPass = (name, lhcPeriod) =>
            nameToSimulationPass[name].associations.dataPassesSuffixes.map((suffix) => `${lhcPeriod}_${suffix}`);
        // eslint-disable-next-line jsdoc/require-param
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
                const expectedRunNumbers = (await RunRepository.findAll({
                    where: {
                        runNumber: { [Op.in]: nameToSimulationPass[name].associations.runNumbers },
                        definition: RunDefinition.PHYSICS,
                    },
                })).map(({ runNumber }) => runNumber);

                expect(runs.map(({ runNumber }) => runNumber)).to.have.all.members(expectedRunNumbers);
            }
        }
    });
};
