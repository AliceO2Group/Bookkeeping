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

const { repositories: { LogRepository } } = require('../../../lib/database');
const { log: { GetAllRunsUseCase } } = require('../../../lib/usecases');
const { dtos: { GetAllRunsDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllRunsDto;

    beforeEach(async () => {
        getAllRunsDto = await GetAllRunsDto.validateAsync({});
    });

    it('should return an array', async () => {
        const { runs } = await new GetAllRunsUseCase()
            .execute();

        expect(runs).to.be.an('array');
    });

    it('should return an array, only containing human originated runs', async () => {
        getAllRunsDto.query = { filter: { origin: 'human' } };
        const { runs } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(runs).to.be.an('array');
        for (const log of runs) {
            expect(log.origin).to.equal('human');
        }
    });

    it('should return runs with a full tag collection regardless of filter', async () => {
        getAllRunsDto.query = { filter: { tag: { values: [1], operation: 'or' } } };

        const filteredResult = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);
        expect(filteredResult.runs.length).to.be.greaterThan(0);
        const [firstFilteredLog] = filteredResult.runs;

        const unfilteredResult = await new GetAllRunsUseCase()
            .execute();
        const firstUnfilteredLog = unfilteredResult.runs.find((log) => log.id === firstFilteredLog.id);

        expect(firstUnfilteredLog.tags).to.deep.equal(firstFilteredLog.tags);
    });

    it('should return a count that is the same as the count method of the repository', async () => {
        const expectedCount = await LogRepository.count();

        const { count } = await new GetAllRunsUseCase()
            .execute(getAllRunsDto);

        expect(count).to.equal(expectedCount);
    });
};
