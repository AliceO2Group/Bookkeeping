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

const { flp: { GetAllFlpsUseCase } } = require('../../../lib/usecases');
const { dtos: { GetAllFlpsDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getAllFlpsDto;

    beforeEach(async () => {
        getAllFlpsDto = await GetAllFlpsDto.validateAsync({});
    });

    it('should return an array', async () => {
        const { flps } = await new GetAllFlpsUseCase()
            .execute();

        expect(flps).to.be.an('array');
    });

    it('should return an array, only containing human originated flps', async () => {
        getAllFlpsDto.query = { filter: { origin: 'human' } };
        const { flps } = await new GetAllFlpsUseCase()
            .execute(getAllFlpsDto);

        expect(flps).to.be.an('array');
        for (const flp of flps) {
            expect(flp.origin).to.equal('human');
        }
    });
};
