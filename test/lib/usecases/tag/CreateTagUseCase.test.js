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

const { repositories: { TagRepository } } = require('../../../../lib/database/index.js');
const { tag: { CreateTagUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { CreateTagDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createTagDto;

    beforeEach(async () => {
        createTagDto = await CreateTagDto.validateAsync({
            body: {
                text: `TAG#${new Date().getTime()}`,
            },
        });
    });

    it('should insert a new Tag', async () => {
        const nTagsBefore = await TagRepository.count();

        await new CreateTagUseCase()
            .execute(createTagDto);

        const nTagsAfter = await TagRepository.count();
        expect(nTagsAfter).to.be.greaterThan(nTagsBefore);
    });

    it('should insert a new Tag with the same title as provided', async () => {
        const expectedTitle = `Tag #${Math.round(Math.random() * 1000)}`;

        createTagDto.body.text = expectedTitle;
        const result = await new CreateTagUseCase()
            .execute(createTagDto);

        expect(result.text).to.equal(expectedTitle);
    });

    it('should return null if we are trying to create the same tag again', async () => {
        const nTagsBefore = await TagRepository.count();

        await new CreateTagUseCase()
            .execute(createTagDto);

        const nTagsAfter = await TagRepository.count();
        expect(nTagsAfter).to.be.greaterThan(nTagsBefore);

        const result = await new CreateTagUseCase()
            .execute(createTagDto);

        expect(result).to.be.null;
        expect(await TagRepository.count()).to.equal(nTagsAfter);
    });
};
