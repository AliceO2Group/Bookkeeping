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

const { repositories: { TagRepository }, utilities: { QueryBuilder } } = require('../../../../../lib/database/index.js');
const { tagService } = require('../../../../../lib/server/services/tag/TagService.js');
const assert = require('assert');
const { expect } = require('chai');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const { ConflictError } = require('../../../../../lib/server/errors/ConflictError.js');

module.exports = () => {
    describe('getAll', () => {
        it('should successfully return an array with tags', async () => {
            expect(await tagService.getAll()).to.be.an('array');
        });

        it('should return the user who last edited each tag', async () => {
            for (const tag of await tagService.getAll()) {
                expect(tag).to.have.property('lastEditedBy');
                expect(tag).to.not.have.property('lastEditedName');
                expect(tag).to.not.have.property('lastEditedByUserId');
                if (tag.lastEditedBy !== null) {
                    expect(tag.lastEditedBy).to.have.all.keys('name');
                }
            }
        });

        it('should return tags sorted by text, archived tags last', async () => {
            const tags = await tagService.getAll();

            const sorted = Array.from(tags);
            sorted.sort((a, b) => {
                if (a.archived === b.archived) {
                    return a.text.localeCompare(b.text);
                } else {
                    return a.archived - b.archived;
                }
            });

            expect(tags).to.eql(sorted);
        });

        it('should successfully return an array with tags with specified ids', async () => {
            const tags = await tagService.getAll({ filter: { ids: '1,2' } });

            expect(tags).to.have.lengthOf(2);
            expect(tags[0].id).to.equal(1);
            expect(tags[0].text).to.equal('FOOD');
            expect(tags[1].id).to.equal(2);
            expect(tags[1].text).to.equal('RUN');
        });

        it('should return an empty array if no tag was found with specified ids', async () => {
            expect(await tagService.getAll({ filter: { ids: '5002' } })).to.have.lengthOf(0);
        });

        it('should successfully return an array with tags with specified texts', async () => {
            const tags = await tagService.getAll({ filter: { texts: 'FOOD,SL' } });

            expect(tags).to.have.lengthOf(2);
            expect(tags[0].id).to.equal(1);
            expect(tags[0].text).to.equal('FOOD');
            expect(tags[1].id).to.equal(8);
            expect(tags[1].text).to.equal('SL');
        });

        it('should successfully return an array with tags containing given text search', async () => {
            let tags = await tagService.getAll({ filter: { partialText: 'MAI' } });
            expect(tags).to.have.lengthOf(1);
            expect(tags[0].id).to.equal(3);
            expect(tags[0].text).to.equal('MAINTENANCE');

            tags = await tagService.getAll({ filter: { partialText: 'ANCE' } });
            expect(tags).to.have.lengthOf(1);
            expect(tags[0].id).to.equal(3);
            expect(tags[0].text).to.equal('MAINTENANCE');

            tags = await tagService.getAll({ filter: { partialText: '-TAG-' } });
            expect(tags).to.have.lengthOf(31);
            expect(tags.every((tag) => tag.text.includes('-TAG-'))).to.be.true;

            tags = await tagService.getAll({ filter: { partialText: 'DO-NOT-EXISTS' } });
            expect(tags).to.have.lengthOf(0);
        });

        it('should successfully return an array with tags with specified emails', async () => {
            const tags = await tagService.getAll({ filter: { emails: 'other-group@cern.ch' } });

            expect(tags).to.have.lengthOf(1);
            expect(tags[0].id).to.equal(8);
            expect(tags[0].text).to.equal('SL');
        });

        it('should successfully return an array with tags with specified mattermosts', async () => {
            const tags = await tagService.getAll({ filter: { mattermosts: 'marathon,,food' } });

            expect(tags).to.have.lengthOf(2);
            expect(tags[0].id).to.equal(1);
            expect(tags[0].text).to.equal('FOOD');
            expect(tags[1].id).to.equal(2);
            expect(tags[1].text).to.equal('RUN');
        });
    });

    describe('getByIdentifier', () => {
        /**
         * Ids of the tags created by a test, removed after each test even if it fails
         * @type {number[]}
         */
        let createdTagsIds = [];

        afterEach(async () => {
            if (createdTagsIds.length > 0) {
                await TagRepository.removeAll(new QueryBuilder().where('id').oneOf(...createdTagsIds));
                createdTagsIds = [];
            }
        });

        it('should return a tag by id', async () => {
            const result = await tagService.getByIdentifier({ id: 1 });

            expect(result).to.have.ownProperty('id');
            expect(result.id).to.equal(1);
        });

        it('should return the user who last edited the tag', async () => {
            const createdTag = await TagRepository.insert({ text: `TAG-LAST-EDITED-${Date.now()}`, lastEditedByUserId: 2 });
            createdTagsIds.push(createdTag.id);

            expect((await tagService.getByIdentifier({ id: createdTag.id })).lastEditedBy).to.deep.equal({ name: 'Jan Jansen' });
        });

        it('should return null last editor for a tag that was never edited', async () => {
            const createdTag = await TagRepository.insert({ text: `TAG-NEVER-EDITED-${Date.now()}` });
            createdTagsIds.push(createdTag.id);

            expect((await tagService.getByIdentifier({ id: createdTag.id })).lastEditedBy).to.be.null;
        });

        it('should return a tag by text with its email and mattermost fields', async () => {
            const result = await tagService.getByIdentifier({ text: 'FOOD' });

            expect(result.mattermost).to.equal('food');
            expect(result.email).to.equal('food-group@cern.ch');
            expect(result.description).to.equal('The food\'s related tag');
        });

        it('should return null when no tag matches', async () => {
            expect(await tagService.getByIdentifier({ text: '9999999999' })).to.be.null;
            expect(await tagService.getByIdentifier({ id: 9999999 })).to.be.null;
        });

        it('should reject when no id or text is given', async () => {
            await assert.rejects(() => tagService.getByIdentifier({}), new BadParameterError('Can not find without tag id or text'));
        });
    });

    describe('create', () => {
        let tag;
        const userRelation = { userId: 1 };

        beforeEach(() => {
            tag = { text: `TAG#${new Date().getTime()}` };
        });

        it('should insert a new Tag', async () => {
            const nTagsBefore = await TagRepository.count();

            await tagService.create(tag, userRelation);

            expect(await TagRepository.count()).to.be.greaterThan(nTagsBefore);
        });

        it('should insert a new Tag with the same title as provided', async () => {
            tag.text = `Tag #${Math.round(Math.random() * 1000)}`;

            expect((await tagService.create(tag, userRelation)).text).to.equal(tag.text);
        });

        it('should reject with a ConflictError if we are trying to create the same tag again', async () => {
            const nTagsBefore = await TagRepository.count();

            await tagService.create(tag, userRelation);

            const nTagsAfter = await TagRepository.count();
            expect(nTagsAfter).to.be.greaterThan(nTagsBefore);

            await assert.rejects(() => tagService.create(tag, userRelation), new ConflictError('The provided entity already exists'));
            expect(await TagRepository.count()).to.equal(nTagsAfter);
        });

        it('should store the id of the user creating the tag', async () => {
            const createdTag = await tagService.create(tag, userRelation);
            expect(createdTag.lastEditedBy).to.deep.equal({ name: 'John Doe' });
            expect(createdTag).to.not.have.property('lastEditedName');

            const storedTag = await TagRepository.findOne({ where: { id: createdTag.id } });
            expect(storedTag.lastEditedByUserId).to.equal(1);
        });

        it('should not modify the given tag', async () => {
            const given = { ...tag };
            await tagService.create(tag, userRelation);
            expect(tag).to.eql(given);
        });

        it('should reject the creation if no user is provided', async () => {
            const nTagsBefore = await TagRepository.count();

            await assert.rejects(() => tagService.create(tag, {}), new BadParameterError('A user is required to create a tag'));
            expect(await TagRepository.count()).to.equal(nTagsBefore);
        });

        it('should reject the creation if the user does not exist', async () => {
            const nTagsBefore = await TagRepository.count();

            await assert.rejects(
                () => tagService.create(tag, { userId: 9999 }),
                new NotFoundError('User with this id (9999) could not be found'),
            );
            expect(await TagRepository.count()).to.equal(nTagsBefore);
        });

        it('should successfully create a new tag with a description', async () => {
            tag.description = 'A description';

            const createdTag = await tagService.create(tag, userRelation);
            expect(createdTag).to.be.an('object');
            expect(createdTag.description).to.equal('A description');
        });
    });

    describe('update', () => {
        let patch;

        beforeEach(() => {
            patch = {
                mattermost: 'tag,tag,tag',
                email: 'cern@tag.ch,cern@othertag.ch',
                description: 'The new tag\'s description',
                archivedAt: Date.now(),
            };
        });

        it('should save the correct values', async () => {
            const result = await tagService.update(3, patch, { userId: 1 });

            expect(result.mattermost).to.equal('tag,tag,tag');
            expect(result.lastEditedBy).to.deep.equal({ name: 'John Doe' });
            expect(result).to.not.have.property('lastEditedName');
            expect(result.email).to.equal('cern@tag.ch,cern@othertag.ch');
            expect(result.description).to.equal('The new tag\'s description');
            expect(result.archived).to.be.true;
        });

        it('should store the id of the user performing the update', async () => {
            const result = await tagService.update(3, patch, { userId: 2 });
            expect(result.lastEditedBy).to.deep.equal({ name: 'Jan Jansen' });
        });

        it('should reject when no user is provided', async () => {
            await assert.rejects(() => tagService.update(3, patch, {}), new BadParameterError('A user is required to update a tag'));
        });

        it('should reject when the user does not exist', async () => {
            await assert.rejects(
                () => tagService.update(3, patch, { userId: 9999 }),
                new NotFoundError('User with this id (9999) could not be found'),
            );
        });

        it('should reject when the tag does not exist', async () => {
            await assert.rejects(
                () => tagService.update(9999, patch, { userId: 1 }),
                new NotFoundError('Tag with this id (9999) could not be found'),
            );
        });
    });

    describe('remove', () => {
        let createdTag;

        beforeEach(async () => {
            createdTag = await tagService.create({ text: `TAG#${new Date().getTime()}` }, { userId: 1 });
        });

        it('should remove a tag', async () => {
            const nTagsBefore = await TagRepository.count();

            await tagService.remove(createdTag.id);

            expect(await TagRepository.count()).to.be.lessThan(nTagsBefore);
        });

        it('should return the removed tag', async () => {
            const result = await tagService.remove(createdTag.id);

            expect(result.id).to.equal(createdTag.id);
            expect(result.text).to.equal(createdTag.text);
        });

        it('should return null if the tag does not exist', async () => {
            expect(await tagService.remove(9999999)).to.be.null;
        });
    });

    describe('getLogs', () => {
        it('should return the logs carrying the tag with their total count', async () => {
            const { logs, count } = await tagService.getLogs(3);

            expect(logs).to.be.an('array');
            expect(count).to.be.greaterThan(0);
            // Log 1 carries the tag 3
            expect(logs.map(({ id }) => id)).to.include(1);
        });

        it('should apply the given pagination but still return the total count', async () => {
            const { count: totalCount } = await tagService.getLogs(3);
            const { logs, count } = await tagService.getLogs(3, { limit: 1, offset: 0 });

            expect(logs).to.have.lengthOf(1);
            expect(count).to.equal(totalCount);
        });

        it('should return null if the tag does not exist', async () => {
            expect(await tagService.getLogs(9999999)).to.be.null;
        });
    });
};
