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
const assert = require('assert');
const { BadParameterError } = require('../../../../lib/server/errors/BadParameterError.js');
const { NotFoundError } = require('../../../../lib/server/errors/NotFoundError.js');

const { expect } = chai;

module.exports = () => {
    let updateTagDto;

    beforeEach(async () => {
        updateTagDto = await UpdateTagDto.validateAsync({
            body: {
                mattermost: 'tag,tag,tag',
                email: 'cern@tag.ch,cern@othertag.ch',
                description: 'The new tag\'s description',
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
        const result = await new UpdateTagUseCase()
            .execute(updateTagDto);
        expect(result.mattermost).to.equal('tag,tag,tag');
        expect(result.lastEditedBy).to.deep.equal({ name: 'John Doe' });
        expect(result).to.not.have.property('lastEditedName');
        expect(result.email).to.equal('cern@tag.ch,cern@othertag.ch');
        expect(result.description).to.equal('The new tag\'s description');
        expect(result.archived).to.be.true;
    });

    it('should store the id of the user performing the update', async () => {
        updateTagDto.session = {
            personid: 456,
            id: 2,
            name: 'Jan Jansen',
        };
        const result = await new UpdateTagUseCase()
            .execute(updateTagDto);
        expect(result.lastEditedBy).to.deep.equal({ name: 'Jan Jansen' });
    });

    it('should reject when no user is provided in the session', async () => {
        delete updateTagDto.session;
        await assert.rejects(
            () => new UpdateTagUseCase().execute(updateTagDto),
            new BadParameterError('A user is required to update a tag'),
        );
    });

    it('should reject when the session user does not exist', async () => {
        updateTagDto.session = { id: 9999, externalId: 9999, name: 'Ghost' };
        await assert.rejects(
            () => new UpdateTagUseCase().execute(updateTagDto),
            new NotFoundError('User with this id (9999) could not be found'),
        );
    });

    it('should reject when the tag does not exist', async () => {
        updateTagDto.params.tagId = 9999;
        await assert.rejects(
            () => new UpdateTagUseCase().execute(updateTagDto),
            new NotFoundError('Tag with this id (9999) could not be found'),
        );
    });
};
