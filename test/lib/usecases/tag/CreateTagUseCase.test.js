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
const assert = require('assert');
const { BadParameterError } = require('../../../../lib/server/errors/BadParameterError.js');
const { NotFoundError } = require('../../../../lib/server/errors/NotFoundError.js');
const { ConflictError } = require('../../../../lib/server/errors/ConflictError.js');

const { expect } = chai;

module.exports = () => {
    let createTagDto;

    beforeEach(async () => {
        createTagDto = await CreateTagDto.validateAsync({
            body: {
                text: `TAG#${new Date().getTime()}`,
            },
        });
        createTagDto.session = { id: 1, externalId: 1, name: 'John Doe' };
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

    it('should reject with a ConflictError if we are trying to create the same tag again', async () => {
        const nTagsBefore = await TagRepository.count();

        await new CreateTagUseCase()
            .execute(createTagDto);

        const nTagsAfter = await TagRepository.count();
        expect(nTagsAfter).to.be.greaterThan(nTagsBefore);

        await assert.rejects(
            () => new CreateTagUseCase().execute(createTagDto),
            new ConflictError('The provided entity already exists'),
        );
        expect(await TagRepository.count()).to.equal(nTagsAfter);
    });

    it('should store the id of the user creating the tag', async () => {
        const tag = await new CreateTagUseCase().execute(createTagDto);
        expect(tag).to.not.have.property('lastEditedName');

        const storedTag = await TagRepository.findOne({ where: { id: tag.id } });
        expect(storedTag.lastEditedByUserId).to.equal(1);
    });

    it('should reject the creation if no user is provided', async () => {
        delete createTagDto.session;
        const nTagsBefore = await TagRepository.count();

        await assert.rejects(
            () => new CreateTagUseCase().execute(createTagDto),
            new BadParameterError('A user is required to create a tag'),
        );
        expect(await TagRepository.count()).to.equal(nTagsBefore);
    });

    it('should reject the creation if the user does not exist', async () => {
        createTagDto.session = { id: 9999, externalId: 9999, name: 'Ghost' };
        const nTagsBefore = await TagRepository.count();

        await assert.rejects(
            () => new CreateTagUseCase().execute(createTagDto),
            new NotFoundError('User with this id (9999) could not be found'),
        );
        expect(await TagRepository.count()).to.equal(nTagsBefore);
    });

    it('should successfully create a new tag with a description', async () => {
        createTagDto.body.description = 'A description';
        const tag = await new CreateTagUseCase().execute(createTagDto);
        expect(tag).to.be.an('object');
        expect(tag.description).to.equal('A description');
    });
};
