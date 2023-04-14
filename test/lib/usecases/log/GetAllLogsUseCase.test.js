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

    it('should return a count that is the same as the count method of the repository', async () => {
        const expectedCount = await LogRepository.count();

        const { count } = await new GetAllLogsUseCase()
            .execute(getAllLogsDto);

        expect(count).to.equal(expectedCount);
    });
};
