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

const { repositories: { LogRepository } } = require('../../../../lib/database/index.js');
const { log: { GetAllLogsUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { GetAllLogsDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllLogsDto;

    beforeEach(async () => {
        getAllLogsDto = await GetAllLogsDto.validateAsync({});
    });

    it('should return an array', async () => {
        const { logs } = await new GetAllLogsUseCase()
            .execute();

        expect(logs).to.be.an('array');
    });

    it('should return the data passes of each log', async () => {
        const { logs } = await new GetAllLogsUseCase().execute();

        expect(logs.every(({ dataPasses }) => Array.isArray(dataPasses))).to.be.true;
        expect(logs.find(({ id }) => id === 119).dataPasses.map(({ name }) => name)).to.deep.equal(['LHC22b_apass1']);
    });

    it('should return the simulation passes of each log', async () => {
        const { logs } = await new GetAllLogsUseCase().execute();

        expect(logs.every(({ simulationPasses }) => Array.isArray(simulationPasses))).to.be.true;
        expect(logs.find(({ id }) => id === 119).simulationPasses.map(({ name }) => name)).to.deep.equal(['LHC23k6c']);
    });

    it('should return an array, only containing human originated logs', async () => {
        getAllLogsDto.query = { filter: { origin: 'human' } };
        const { logs } = await new GetAllLogsUseCase()
            .execute(getAllLogsDto);

        expect(logs).to.be.an('array');
        for (const log of logs) {
            expect(log.origin).to.equal('human');
        }
    });

    it('should return logs with a full tag collection regardless of filter', async () => {
        getAllLogsDto.query = { filter: { tags: { values: ['FOOD'], operation: 'or' } } };

        const filteredResult = await new GetAllLogsUseCase().execute(getAllLogsDto);
        expect(filteredResult.logs.length).to.be.greaterThan(0);
        const [firstFilteredLog] = filteredResult.logs;

        const unfilteredResult = await new GetAllLogsUseCase().execute();
        const firstUnfilteredLog = unfilteredResult.logs.find((log) => log.id === firstFilteredLog.id);

        expect(firstUnfilteredLog.tags).to.deep.equal(firstFilteredLog.tags);
    });

    it('should return a reply count if applicable', async () => {
        const rootLogId = 117;
        getAllLogsDto.query = { filter: { rootLog: rootLogId } };

        const filteredResult = await new GetAllLogsUseCase().execute(getAllLogsDto);
        for (const log of filteredResult.logs) {
            expect(log).to.not.have.property('replies');
        }

        const unfilteredResult = await new GetAllLogsUseCase()
            .execute();
        const rootLog = unfilteredResult.logs.find((log) => log.id === rootLogId);
        expect(filteredResult.count).to.equal(rootLog.replies);
    });

    it('should successfully filter on run numbers', async () => {
        const runNumbers = [1, 2];
        getAllLogsDto.query = { filter: { runNumbers } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(3);
            for (const log of filteredResult) {
                const relatedRunNumbers = log.runs.map(({ runNumber }) => runNumber);
                expect(runNumbers.every((runNumber) => relatedRunNumbers.includes(runNumber))).to.be.true;
            }
        }
    });

    it('should successfully filter on log content', async () => {
        const content = 'particle';
        getAllLogsDto.query = { filter: { content } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(2);
            for (const log of filteredResult) {
                expect(log.text.includes(content)).to.be.true;
            }
        }

        getAllLogsDto.query = { filter: { content: 'this-content-do-not-exists-anywhere' } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(0);
        }
    });

    it('should successfully filter on lhc fills', async () => {
        const fillNumbers = [1, 6];

        getAllLogsDto.query = { filter: { fillNumbers } };
        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.have.lengthOf(1);

            const fillNumbersPerLog = filteredResult.map(({ lhcFills }) => lhcFills.map(({ fillNumber }) => fillNumber));

            // For each returned log, check at least one of the associated fill numbers was in the filter query
            expect(fillNumbersPerLog.every((logFillNumbers) =>
                logFillNumbers.includes(fillNumbers[0]) && logFillNumbers.includes(fillNumbers[1]))).to.be.true;
        }
    });

    it('should successfully filter on data passes, requiring at least one of them', async () => {
        // Other tests of the suite may have created logs linked to data passes, so only check seeded logs and the filter semantic
        const getDataPassNames = (log) => log.dataPasses.map(({ name }) => name);

        getAllLogsDto.query = { filter: { dataPasses: ['LHC22b_apass1'] } };
        let { logs } = await new GetAllLogsUseCase().execute(getAllLogsDto);
        expect(logs.map(({ id }) => id)).to.include.members([1, 119]);
        expect(logs.map(({ id }) => id)).to.not.include(2);
        expect(logs.every((log) => getDataPassNames(log).includes('LHC22b_apass1'))).to.be.true;

        getAllLogsDto.query = { filter: { dataPasses: ['LHC22b_skimming', 'LHC22a_apass1'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs.map(({ id }) => id)).to.include.members([1, 2]);
        expect(logs.map(({ id }) => id)).to.not.include(119);
        expect(logs.every((log) => ['LHC22b_skimming', 'LHC22a_apass1'].some((name) => getDataPassNames(log).includes(name)))).to.be.true;
        // Linked data passes are all returned, not only the filtered ones
        expect(getDataPassNames(logs.find(({ id }) => id === 1)).sort()).to.deep.equal(['LHC22b_apass1', 'LHC22b_skimming']);

        getAllLogsDto.query = { filter: { dataPasses: ['NOT_A_DATA_PASS'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs).to.lengthOf(0);

        // Unknown data passes are ignored when at least another one matches
        getAllLogsDto.query = { filter: { dataPasses: ['LHC22a_apass1', 'NOT_A_DATA_PASS'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs.map(({ id }) => id)).to.include(2);
    });

    it('should successfully filter on simulation passes, requiring at least one of them', async () => {
        // Other tests of the suite may have created logs linked to simulation passes, so only check seeded logs and the filter semantic
        const getSimulationPassNames = (log) => log.simulationPasses.map(({ name }) => name);

        getAllLogsDto.query = { filter: { simulationPasses: ['LHC23k6c'] } };
        let { logs } = await new GetAllLogsUseCase().execute(getAllLogsDto);
        expect(logs.map(({ id }) => id)).to.include.members([1, 119]);
        expect(logs.map(({ id }) => id)).to.not.include(2);
        expect(logs.every((log) => getSimulationPassNames(log).includes('LHC23k6c'))).to.be.true;

        getAllLogsDto.query = { filter: { simulationPasses: ['LHC23k6b', 'LHC23k6a'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs.map(({ id }) => id)).to.include.members([1, 2]);
        expect(logs.map(({ id }) => id)).to.not.include(119);
        expect(logs.every((log) => ['LHC23k6b', 'LHC23k6a'].some((name) => getSimulationPassNames(log).includes(name)))).to.be.true;
        // Linked simulation passes are all returned, not only the filtered ones
        expect(getSimulationPassNames(logs.find(({ id }) => id === 1)).sort()).to.deep.equal(['LHC23k6b', 'LHC23k6c']);

        getAllLogsDto.query = { filter: { simulationPasses: ['NOT_A_SIMULATION_PASS'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs).to.lengthOf(0);

        // Unknown simulation passes are ignored when at least another one matches
        getAllLogsDto.query = { filter: { simulationPasses: ['LHC23k6a', 'NOT_A_SIMULATION_PASS'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs.map(({ id }) => id)).to.include(2);
    });

    it('should successfully combine the data passes and simulation passes filters', async () => {
        getAllLogsDto.query = { filter: { dataPasses: ['LHC22b_skimming'], simulationPasses: ['LHC23k6b'] } };
        let { logs } = await new GetAllLogsUseCase().execute(getAllLogsDto);
        expect(logs.map(({ id }) => id)).to.include(1);
        expect(logs.map(({ id }) => id)).to.not.include(119);

        getAllLogsDto.query = { filter: { dataPasses: ['LHC22b_skimming'], simulationPasses: ['LHC23k6a'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs).to.lengthOf(0);
    });

    it('should successfully filter on the LHC periods of the linked data passes', async () => {
        const getPeriodsDataPassNames = (log) => log.dataPasses.map(({ name }) => name.split('_')[0]);

        getAllLogsDto.query = { filter: { lhcPeriods: ['LHC22b'] } };
        let { logs } = await new GetAllLogsUseCase().execute(getAllLogsDto);
        expect(logs.map(({ id }) => id)).to.include.members([1, 119]);
        expect(logs.map(({ id }) => id)).to.not.include(2);
        expect(logs.every((log) => getPeriodsDataPassNames(log).includes('LHC22b'))).to.be.true;

        getAllLogsDto.query = { filter: { lhcPeriods: ['LHC22a'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs.map(({ id }) => id)).to.deep.equal([2]);

        // At least one of the periods must match
        getAllLogsDto.query = { filter: { lhcPeriods: ['LHC22a', 'LHC22b'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs.map(({ id }) => id)).to.include.members([1, 2, 119]);

        getAllLogsDto.query = { filter: { lhcPeriods: ['NOT_A_PERIOD'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs).to.lengthOf(0);
    });

    it('should successfully combine the data passes and LHC periods filters', async () => {
        getAllLogsDto.query = { filter: { dataPasses: ['LHC22b_skimming'], lhcPeriods: ['LHC22b'] } };
        let { logs } = await new GetAllLogsUseCase().execute(getAllLogsDto);
        expect(logs.map(({ id }) => id)).to.include(1);
        expect(logs.map(({ id }) => id)).to.not.include(119);

        getAllLogsDto.query = { filter: { dataPasses: ['LHC22b_skimming'], lhcPeriods: ['LHC22a'] } };
        ({ logs } = await new GetAllLogsUseCase().execute(getAllLogsDto));
        expect(logs).to.lengthOf(0);
    });

    it ('should successfully filter on log environment', async () => {
        const environmentIds = ['8E4aZTjY', 'eZF99lH6'];
        getAllLogsDto.query = { filter: { environmentIds } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(2);
            for (const log of filteredResult) {
                const relatedenvironmentIds = log.environments.map(({ id }) => id);
                expect(environmentIds.every((env) => relatedenvironmentIds.includes(env))).to.be.true;
            }
        }

        getAllLogsDto.query = { filter: { environmentIds: ['non-existent-environment'] } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.have.lengthOf(0);
        }
    });

    it('should return a count that is the same as the count method of the repository', async () => {
        const expectedCount = await LogRepository.count();

        const { count } = await new GetAllLogsUseCase()
            .execute(getAllLogsDto);

        expect(count).to.equal(expectedCount);
    });
};
