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

const { tag: { GetTagUseCase } } = require('../../../../lib/usecases/index.js');
const { repositories: { TagRepository }, utilities: { QueryBuilder } } = require('../../../../lib/database/index.js');
const { dtos: { GetTagDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let getLogDto;

    beforeEach(async () => {
        getLogDto = await GetTagDto.validateAsync({
            params: {
                tagId: 1,
            },
        });
    });

    it('should return an object that has the `id` property', async () => {
        const result = await new GetTagUseCase()
            .execute(getLogDto);

        expect(result).to.have.ownProperty('id');
        expect(result.id).to.equal(1);
    });

    it('should return the user who last edited the tag', async () => {
        const createdTag = await TagRepository.insert({ text: `TAG-LAST-EDITED-${Date.now()}`, lastEditedByUserId: 2 });
        const result = await new GetTagUseCase().execute({ params: { tagId: createdTag.id } });

        expect(result.lastEditedBy).to.deep.equal({ name: 'Jan Jansen' });

        await TagRepository.removeAll(new QueryBuilder().where('id').is(createdTag.id));
    });

    it('should return null last editor for a tag that was never edited', async () => {
        const createdTag = await TagRepository.insert({ text: `TAG-NEVER-EDITED-${Date.now()}` });
        const result = await new GetTagUseCase().execute({ params: { tagId: createdTag.id } });

        expect(result.lastEditedBy).to.be.null;

        await TagRepository.removeAll(new QueryBuilder().where('id').is(createdTag.id));
    });
};
