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

const { repositories: { TagRepository } } = require('../../../../lib/database');
const { tag: { CreateTagUseCase, DeleteTagUseCase } } = require('../../../../lib/usecases');
const { dtos: { CreateTagDto } } = require('../../../../lib/domain');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let createdTag;

    beforeEach(async () => {
        const createTagDto = await CreateTagDto.validateAsync({
            body: {
                text: `TAG#${new Date().getTime()}`,
            },
        });

        createdTag = await new CreateTagUseCase()
            .execute(createTagDto);
    });

    it('should remove a tag', async () => {
        const nTagsBefore = await TagRepository.count();

        await new DeleteTagUseCase()
            .execute({
                params: {
                    tagId: createdTag.id,
                },
            });

        const nTagsAfter = await TagRepository.count();
        expect(nTagsAfter).to.be.lessThan(nTagsBefore);
    });

    it('should return the removed tag', async () => {
        const nTagsBefore = await TagRepository.count();

        const result = await new DeleteTagUseCase()
            .execute({
                params: {
                    tagId: createdTag.id,
                },
            });

        const nTagsAfter = await TagRepository.count();
        expect(nTagsAfter).to.be.lessThan(nTagsBefore);

        expect(result.id).to.equal(createdTag.id);
        expect(result.text).to.equal(createdTag.text);
    });
};
