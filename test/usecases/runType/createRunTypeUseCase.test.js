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
const { repositories: { RunTypeRepository } } = require('../../../lib/database');
const { lhcFill: { CreateRunTypeUseCase } } = require('../../../lib/usecases');
const { dtos: { CreateRunTypeDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createRunTypeDto;

    beforeEach(async () => {
        createRunTypeDto = await CreateRunTypeDto.validateAsync({
            body: {
                fillNumber: 123123123,
                stableBeamsStart: new Date('2022-03-22 15:00:00'),
                stableBeamsEnd: new Date('2022-03-22 15:00:00'),
                stableBeamsDuration: 600,
                beamType: 'Pb-Pb',
                fillingSchemeName: 'schemename',
            },
        });
        createRunTypeDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    it('should insert a new RunType', async () => {
        const nEnvsBefore = await RunTypeRepository.count();

        await new CreateRunTypeUseCase()
            .execute(createRunTypeDto);

        const nEnvsAfter = await RunTypeRepository.count();
        expect(nEnvsAfter).to.be.greaterThan(nEnvsBefore);
    });
};
