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

const { repositories: { FlpRoleRepository } } = require('../../../../lib/database/index.js');
const { flp: { CreateFlpUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { CreateFlpDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createFlpDto;

    beforeEach(async () => {
        createFlpDto = await CreateFlpDto.validateAsync({
            body: {
                name: 'FlpTest',
                hostname: 'TestFlp',
                runNumber: 36,
            },
        });
        createFlpDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });

    it('should insert a new Flp', async () => {
        const nFlpsBefore = await FlpRoleRepository.count();

        await new CreateFlpUseCase()
            .execute(createFlpDto);

        const nFlpsAfter = await FlpRoleRepository.count();
        expect(nFlpsAfter).to.be.greaterThan(nFlpsBefore);
    });
};
