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

const { tag: { UpdateTagUseCase } } = require('../../../../lib/usecases/index.js');
const { dtos: { UpdateTagDto } } = require('../../../../lib/domain/index.js');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    let updateTagDto;

    beforeEach(async () => {
        updateTagDto = await UpdateTagDto.validateAsync({
            body: {
                mattermost: 'tag,tag,tag',
                email: 'cern@tag.ch,cern@othertag.ch',
                archivedAt: Date.now(),
            },
            params: {
                tagId: 3,
            },
        });
        updateTagDto.session = {
            personid: 1,
            id: 1,
            name: 'John Doe',
        };
    });
    it('should save the correct values', async () => {
        const { result } = await new UpdateTagUseCase()
            .execute(updateTagDto);
        expect(result.mattermost).to.equal('tag,tag,tag');
        expect(result.lastEditedName).to.equal('John Doe');
        expect(result.email).to.equal('cern@tag.ch,cern@othertag.ch');
        expect(result.archived).to.be.true;
    });

    it('should return an error when calues do not match', async () => {
        const newTagDto = await UpdateTagDto.validateAsync({
            body: {
                mattermost: 'tag,tag,tag',
                email: 'cern@tag.ch',
            },
            params: {
                tagId: 9999,
            },
        });
        newTagDto.session = {
            personid: 1,
            id: 1,
            name: 'John Do',
        };
        const { error } = await new UpdateTagUseCase()
            .execute(newTagDto);
        expect(error.status).to.equal('400');
        expect(error.title).to.equal('this tag with this tag id: (9999) could not be found.');
    });
};
