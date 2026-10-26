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

const { dtos: { CreateTagDto, GetAllTagsDto, GetTagDto, UpdateTagDto, GetTagByNameDto } } = require('../../domain');
const GetAllLogsByTagDto = require('../../domain/dtos/GetAllLogsByTagDto.js');
const { dtoValidator } = require('../utilities');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { tagService } = require('../services/tag/TagService.js');
const { ApiConfig } = require('../../config/index.js');

/**
 * Create a new tag.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const createTag = async (request, response) => {
    const value = await dtoValidator(CreateTagDto, request, response);
    if (!value) {
        return;
    }

    try {
        const tag = await tagService.create(value.body, { userId: value.session?.id });
        response.status(201).json({ data: tag });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Delete tag.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const deleteTag = async (request, response, next) => {
    const value = await dtoValidator(GetTagDto, request, response);
    if (!value) {
        return;
    }

    const tag = await tagService.remove(value.params.tagId);

    if (tag === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Tag with this id (${value.params.tagId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: tag,
        });
    }
};

/**
 * Get all logs with tag.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getLogsByTagId = async (request, response) => {
    const value = await dtoValidator(GetAllLogsByTagDto, request, response);
    if (!value) {
        return;
    }

    const { query: { page = {} } } = value;
    const { limit = ApiConfig.pagination.limit } = page;

    const result = await tagService.getLogs(value.params.tagId, page);

    if (result === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Tag with this id (${value.params.tagId}) could not be found`,
                },
            ],
        });
    } else {
        const { logs, count } = result;
        response.status(200).json({
            data: logs,
            meta: {
                page: {
                    pageCount: Math.ceil(count / limit),
                    totalCount: count,
                },
            },
        });
    }
};

/**
 * Get all tags.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const listTags = async (request, response, next) => {
    const value = await dtoValidator(GetAllTagsDto, request, response);
    if (!value) {
        return;
    }

    const tags = await tagService.getAll({ filter: value.query.filter });

    response.status(tags.length === 0 ? 204 : 200).json({ data: tags });
};

/**
 * Get tag.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getTagById = async (request, response, next) => {
    const value = await dtoValidator(GetTagDto, request, response);
    if (!value) {
        return;
    }

    const tag = await tagService.getByIdentifier({ id: value.params.tagId });

    if (tag === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Tag with this id (${value.params.tagId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: tag,
        });
    }
};

/**
 * Get tag details (emails and mattermost channels) by tag name
 * @param {Object} request The *request* object represents the HTTP request
 * @param {Object} response The *response* object represents the HTTP response
 * @param {Function} next The *next* object represents the next middleware function
 * @returns {undefined}
 */
const getTagByName = async (request, response, next) => {
    const value = await dtoValidator(GetTagByNameDto, request, response);
    if (!value) {
        return;
    }

    const name = decodeURIComponent(value.query.name);
    const tag = await tagService.getByIdentifier({ text: name });

    if (tag === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Tag with this name (${name}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: tag,
        });
    }
};

/**
 * Update tag with only email and mattermost as updatable values.
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const updateTagById = async (request, response) => {
    const value = await dtoValidator(UpdateTagDto, request, response);
    if (!value) {
        return;
    }

    try {
        const tag = await tagService.update(value.params.tagId, value.body, { userId: value.session?.id });
        response.status(201).json({ data: tag });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    createTag,
    deleteTag,
    getLogsByTagId,
    getTagById,
    listTags,
    updateTagById,
    getTagByName,
};
