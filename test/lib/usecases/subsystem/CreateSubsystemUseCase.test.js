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

const { repositories: { SubsystemRepository } } = require('../../../../lib/database/index.js');
const { subsystem: { CreateSubsystemUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { CreateSubsystemDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createSubsystemDto;

    beforeEach(async () => {
        createSubsystemDto = await CreateSubsystemDto.validateAsync({
            body: {
                name: `SYSTEM#${new Date().getTime()}`,
            },
        });
    });

    it('should insert a new Subsystem', async () => {
        const nSubsystemsBefore = await SubsystemRepository.count();

        await new CreateSubsystemUseCase()
            .execute(createSubsystemDto);

        const nSubsystemsAfter = await SubsystemRepository.count();
        expect(nSubsystemsAfter).to.be.greaterThan(nSubsystemsBefore);
    });

    it('should insert a new Subsystem with the same name as provided', async () => {
        const expectedName = `Subsystem #${Math.round(Math.random() * 1000)}`;

        createSubsystemDto.body.name = expectedName;
        const result = await new CreateSubsystemUseCase()
            .execute(createSubsystemDto);

        expect(result.name).to.equal(expectedName);
    });

    it('should return null if we are trying to create the same subsystem again', async () => {
        const nSubsystemsBefore = await SubsystemRepository.count();

        await new CreateSubsystemUseCase()
            .execute(createSubsystemDto);

        const nSubsystemsAfter = await SubsystemRepository.count();
        expect(nSubsystemsAfter).to.be.greaterThan(nSubsystemsBefore);

        const result = await new CreateSubsystemUseCase()
            .execute(createSubsystemDto);

        expect(result).to.be.null;
        expect(await SubsystemRepository.count()).to.equal(nSubsystemsAfter);
    });
};
