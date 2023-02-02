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
const { repositories: { LhcFillRepository } } = require('../../../../lib/database/index.js');
const { lhcFill: { CreateLhcFillUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { CreateLhcFillDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createLhcFillDto;

    beforeEach(async () => {
        createLhcFillDto = await CreateLhcFillDto.validateAsync({
            body: {
                fillNumber: 123123123,
                stableBeamsStart: new Date('2022-03-22 15:00:00'),
                stableBeamsEnd: new Date('2022-03-22 15:00:00'),
                stableBeamsDuration: 600,
                beamType: 'Pb-Pb',
                fillingSchemeName: 'schemename',
            },
        });
        createLhcFillDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    it('should insert a new LhcFill', async () => {
        const nEnvsBefore = await LhcFillRepository.count();

        await new CreateLhcFillUseCase()
            .execute(createLhcFillDto);

        const nEnvsAfter = await LhcFillRepository.count();
        expect(nEnvsAfter).to.be.greaterThan(nEnvsBefore);
    });
    it('should insert a new lhcFill with the right values', async () => {
        createLhcFillDto.body.fillNumber = 123123;
        const { result } = await new CreateLhcFillUseCase()
            .execute(createLhcFillDto);

        expect(result.fillNumber).to.equal(123123);
        expect(result.stableBeamsStart).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
        expect(result.stableBeamsEnd).to.equal(new Date('2022-03-22 15:00:00 utc').getTime());
        expect(result.stableBeamsDuration).to.equal(600);
        expect(result.beamType).to.equal('Pb-Pb');
        expect(result.fillingSchemeName).to.equal('schemename');
    });
    it('should not be able to create with the same id', async () => {
        const { error } = await new CreateLhcFillUseCase()
            .execute(createLhcFillDto);
        expect(error.status).to.equal('409');
        expect(error.detail).to.equal('The provided fillNumber already exists');
    });
};
