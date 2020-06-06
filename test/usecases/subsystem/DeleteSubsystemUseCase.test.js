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

const { repositories: { SubsystemRepository } } = require('../../../lib/database');
const { subsystem: { CreateSubsystemUseCase, DeleteSubsystemUseCase } } = require('../../../lib/usecases');
const { dtos: { CreateSubsystemDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createdSubsystem;

    beforeEach(async () => {
        const createSubsystemDto = await CreateSubsystemDto.validateAsync({
            body: {
                name: `SYSTEM#${new Date().getTime()}`,
            },
        });

        createdSubsystem = await new CreateSubsystemUseCase()
            .execute(createSubsystemDto);
    });

    it('should remove a subsystem', async () => {
        const nSubsystemsBefore = await SubsystemRepository.count();

        await new DeleteSubsystemUseCase()
            .execute({
                params: {
                    subsystemId: createdSubsystem.id,
                },
            });

        const nSubsystemsAfter = await SubsystemRepository.count();
        expect(nSubsystemsAfter).to.be.lessThan(nSubsystemsBefore);
    });

    it('should return the removed subsystem', async () => {
        const nSubsystemsBefore = await SubsystemRepository.count();

        const result = await new DeleteSubsystemUseCase()
            .execute({
                params: {
                    subsystemId: createdSubsystem.id,
                },
            });

        const nSubsystemsAfter = await SubsystemRepository.count();
        expect(nSubsystemsAfter).to.be.lessThan(nSubsystemsBefore);

        expect(result.id).to.equal(createdSubsystem.id);
        expect(result.name).to.equal(createdSubsystem.name);
    });
};
