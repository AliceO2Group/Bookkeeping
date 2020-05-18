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

const { log: { GetAllLogsUseCase } } = require('../../../lib/usecases');
const { dtos: { GetAllLogsDto } } = require('../../../lib/domain');
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
};
