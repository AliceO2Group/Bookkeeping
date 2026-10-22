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

const { repositories: { LogRepository, TagRepository }, utilities: { QueryBuilder } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { tagAdapter } = require('../../../database/adapters/index.js');
const { ApiConfig } = require('../../../config/index.js');
const { GetAllLogsUseCase } = require('../../../usecases/log');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getUserOrFail } = require('../user/getUserOrFail.js');
const { getAllTags } = require('./getAllTags.js');
const { getTag } = require('./getTag.js');

/**
 * Add the last editor of the tags (only its name) to a tags query
 *
 * @param {QueryBuilder} queryBuilder the query builder of the query
 * @return {void}
 */
const includeLastEditor = (queryBuilder) => {
    queryBuilder.include({ association: 'lastEditedBy', attributes: ['name'] });
};

/**
 * Global service to read and write tags
 */
class TagService {
    /**
     * Return the tags matching the given filter, non archived tags first then sorted by text
     *
     * The filter can contain the comma separated lists `ids`, `texts` (has priority over `partialText`), `emails` and `mattermosts`,
     * and a `partialText` to keep the tags including this text
     *
     * @param {object} [options] the options of the search
     * @param {object} [options.filter] the filter to apply
     * @return {Promise<Tag[]>} the tags
     */
    async getAll({ filter = {} } = {}) {
        const tags = await getAllTags((queryBuilder) => {
            includeLastEditor(queryBuilder);
            queryBuilder.orderBy((sequelize) => sequelize.literal('archived_at IS NULL'), 'DESC');
            queryBuilder.orderBy('text', 'asc');

            if (filter) {
                const { ids, texts, partialText, emails, mattermosts } = filter;
                if (ids) {
                    queryBuilder.where('id').oneOf(...ids.split(',').filter((id) => id !== ''));
                }
                if (texts) {
                    queryBuilder.where('text').oneOf(...texts.split(',').filter((text) => text !== ''));
                } else if (partialText) {
                    queryBuilder.where('text').substring(partialText);
                }
                if (emails) {
                    queryBuilder.where('email').oneOf(...emails.split(',').filter((email) => email !== ''));
                }
                if (mattermosts) {
                    queryBuilder.where('mattermost').oneOf(...mattermosts.split(',').filter((mattermost) => mattermost !== ''));
                }
            }
        });

        return tags.map(tagAdapter.toEntity);
    }

    /**
     * Return the tag matching the given identifier, or null if there is none
     *
     * @param {TagIdentifier} identifier the identifier of the tag to find
     * @return {Promise<Tag|null>} the tag found or null
     */
    async getByIdentifier(identifier) {
        const tag = await getTag(identifier, includeLastEditor);
        return tag ? tagAdapter.toEntity(tag) : null;
    }

    /**
     * Create a tag
     *
     * @param {Pick<Tag, 'text'|'description'|'email'|'mattermost'|'color'>} tag the tag to create
     * @param {object} relations the relations of the creation
     * @param {number} relations.userId the id of the user creating the tag
     * @return {Promise<Tag>} resolves with the created tag
     * @throws {BadParameterError} if no user is provided
     * @throws {NotFoundError} if the user does not exist
     * @throws {ConflictError} if a tag with the same text already exists
     */
    async create(tag, { userId }) {
        if (userId === undefined || userId === null) {
            throw new BadParameterError('A user is required to create a tag');
        }

        const createdTag = await dataSource.transaction(async () => {
            const user = await getUserOrFail({ userId });

            if (await getTag({ text: tag.text })) {
                throw new ConflictError('The provided entity already exists');
            }

            return TagRepository.insert(tagAdapter.toDatabase({ ...tag, lastEditedByUserId: user.id }));
        });

        // Re-fetch the tag to return it with all its fields, including the last editor
        return this.getByIdentifier({ id: createdTag.id });
    }

    /**
     * Update a tag
     *
     * @param {number} tagId the id of the tag to update
     * @param {Partial<Pick<Tag, 'description'|'email'|'mattermost'|'color'|'archivedAt'>>} patch the new values of the tag
     * @param {object} relations the relations of the update
     * @param {number} relations.userId the id of the user updating the tag
     * @return {Promise<Tag>} resolves with the updated tag
     * @throws {BadParameterError} if no user is provided
     * @throws {NotFoundError} if the tag or the user does not exist
     */
    async update(tagId, { description, email, mattermost, archivedAt, color }, { userId }) {
        if (userId === undefined || userId === null) {
            throw new BadParameterError('A user is required to update a tag');
        }

        await dataSource.transaction(async () => {
            const tag = await getTag({ id: tagId });
            if (!tag) {
                throw new NotFoundError(`Tag with this id (${tagId}) could not be found`);
            }

            const user = await getUserOrFail({ userId });

            tag.description = description;
            tag.email = email;
            tag.color = color;
            tag.mattermost = mattermost;
            tag.archivedAt = archivedAt;
            tag.lastEditedByUserId = user.id;
            await tag.save();
        });

        return this.getByIdentifier({ id: tagId });
    }

    /**
     * Remove a tag
     *
     * @param {number} tagId the id of the tag to remove
     * @return {Promise<Tag|null>} resolves with the removed tag, or null if there was no such tag
     */
    async remove(tagId) {
        const tag = await dataSource.transaction(() => TagRepository.removeOne(new QueryBuilder().where('id').is(tagId)));
        return tag ? tagAdapter.toEntity(tag) : null;
    }

    /**
     * Return a page of the root logs carrying a given tag
     *
     * @param {number} tagId the id of the tag
     * @param {object} [page] the page to return
     * @param {number} [page.limit] the maximum number of logs to return (default to the maximum of the API)
     * @param {number} [page.offset] the number of logs to skip
     * @return {Promise<{logs: Log[], count: number}|null>} the logs and their total count, or null if the tag does not exist
     */
    async getLogs(tagId, { limit = ApiConfig.pagination.limit, offset = 0 } = {}) {
        return dataSource.transaction(async () => {
            const tag = await getTag({ id: tagId });
            if (!tag) {
                return null;
            }

            const { logs, count } = await new GetAllLogsUseCase().execute({
                query: {
                    page: { offset, limit },
                    filter: { tags: { values: [tag.text], operation: 'or' } },
                },
            });

            return { logs: await LogRepository.addChildrenCountByLog(logs), count };
        });
    }
}

exports.TagService = TagService;

exports.tagService = new TagService();
