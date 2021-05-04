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

const { repositories: { FlpRepository } } = require('../../../lib/database');
const { flp: { CreateFlpUseCase } } = require('../../../lib/usecases');
const { dtos: { CreateFlpDto } } = require('../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createFlpDto;

    beforeEach(async () => {
        createFlpDto = await CreateFlpDto.validateAsync({
            body: {
                name: 'FlpTest',
                hostname: 'TestFlp',
            },
        });
        createFlpDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });

    it('should insert a new Flp', async () => {
        const nFlpsBefore = await FlpRepository.count();

        await new CreateFlpUseCase()
            .execute(createFlpDto);

        const nFlpsAfter = await FlpRepository.count();
        expect(nFlpsAfter).to.be.greaterThan(nFlpsBefore);
    });

    /*
     * It('should insert a new Flp with the same hostname as provided', async () => {
     *     const expectedName = 'FlpTest';
     */

    /*
     *     CreateFlpDto.body.name = expectedName;
     *     const { result } = await new CreateFlpUseCase()
     *         .execute(createFlpDto);
     */

    /*
     *     Expect(result.name).to.equal(expectedName);
     * });
     */
};
