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

const { repositories: { LogRepository } } = require('../../../../backend/database/index.js');
const { log: { GetAllLogsUseCase } } = require('../../../../backend/usecases/index.js');
const { dtos: { GetAllLogsDto } } = require('../../../../backend/domain/index.js');
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
        getAllLogsDto.query = { filter: { run: { operation: 'and', values: runNumbers } } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(3);
            for (const log of filteredResult) {
                const relatedRunNumbers = log.runs.map(({ runNumber }) => runNumber);
                expect(runNumbers.every((runNumber) => relatedRunNumbers.includes(runNumber))).to.be.true;
            }
        }

        getAllLogsDto.query = { filter: { run: { operation: 'or', values: runNumbers } } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(6);
            for (const log of filteredResult) {
                const relatedRunNumbers = log.runs.map(({ runNumber }) => runNumber);
                expect(runNumbers.some((runNumber) => relatedRunNumbers.includes(runNumber))).to.be.true;
            }
        }
    });

    it('should sucessfully filter on log content', async () => {
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
        const lhcFills = [1, 6];

        getAllLogsDto.query = { filter: { lhcFills: { operation: 'and', values: lhcFills } } };
        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.have.lengthOf(1);

            const fillNumbersPerLog = filteredResult.map(({ lhcFills }) => lhcFills.map(({ fillNumber }) => fillNumber));

            // For each returned log, check at least one of the associated fill numbers was in the filter query
            expect(fillNumbersPerLog.every((logFillNumbers) =>
                logFillNumbers.includes(lhcFills[0]) && logFillNumbers.includes(lhcFills[1]))).to.be.true;
        }

        getAllLogsDto.query = { filter: { lhcFills: { operation: 'or', values: lhcFills } } };
        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.have.lengthOf(3);

            const fillNumbersPerLog = filteredResult.map(({ lhcFills }) => lhcFills.map(({ fillNumber }) => fillNumber));

            // For each returned log, check at least one of the associated fill numbers was in the filter query
            expect(fillNumbersPerLog.every((logFillNumbers) =>
                logFillNumbers.includes(lhcFills[0]) || logFillNumbers.includes(lhcFills[1]))).to.be.true;
        }
    });

    it ('should successfully filter on log environment', async () => {
        const environments = ['8E4aZTjY', 'eZF99lH6'];
        getAllLogsDto.query = { filter: { environments: { operation: 'and', values: environments } } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(2);
            for (const log of filteredResult) {
                const relatedEnvironments = log.environments.map(({ id }) => id);
                expect(environments.every((env) => relatedEnvironments.includes(env))).to.be.true;
            }
        }

        getAllLogsDto.query = { filter: { environments: { operation: 'or', values: environments } } };

        {
            const { logs: filteredResult } = await new GetAllLogsUseCase().execute(getAllLogsDto);
            expect(filteredResult).to.lengthOf(5);
            for (const log of filteredResult) {
                const relatedEnvironments = log.environments.map(({ id }) => id);
                expect(environments.some((env) => relatedEnvironments.includes(env))).to.be.true;
            }
        }

        getAllLogsDto.query = { filter: { environments: { operation: 'and', values: ['non-existent-environment'] } } };

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
