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
const { repositories: { EnvironmentRepository } } = require('../../../../lib/database/index.js');
const { environment: { CreateEnvironmentUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { CreateEnvironmentDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createEnvDto;

    beforeEach(async () => {
        createEnvDto = await CreateEnvironmentDto.validateAsync({
            body: {
                envId: 'SomeId',
                createdAt: new Date().setHours(0, 0, 0, 0),
                status: 'FAILED',
                statusMessage: 'Some very important message why this actually fails',
            },
        });
        createEnvDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    it('should insert a new environment', async () => {
        const nEnvsBefore = await EnvironmentRepository.count();

        await new CreateEnvironmentUseCase()
            .execute(createEnvDto);

        const nEnvsAfter = await EnvironmentRepository.count();
        expect(nEnvsAfter).to.be.greaterThan(nEnvsBefore);
    });
    it('should insert a new environment with the right values', async () => {
        const newId = 'newId';
        createEnvDto.body.envId = newId;
        const { result } = await new CreateEnvironmentUseCase()
            .execute(createEnvDto);
        expect(result.id).to.equal(newId);

        expect(result.status).to.equal('FAILED');
        expect(result.statusMessage).to.equal(createEnvDto.body.statusMessage);
    });

    it('should block creations with the same envId', async () => {
        const { error } = await new CreateEnvironmentUseCase()
            .execute(createEnvDto);
        expect(error.status).to.equal('409');
    });
};
