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

const {
    tag: {
        CreateTagUseCase,
        DeleteTagUseCase,
        GetAllTagsUseCase,
        GetLogsByTagUseCase,
        GetTagUseCase,
    },
} = require('../../usecases');
const { dtos: { CreateTagDto, GetAllTagsDto, GetTagDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');

/**
 * Create a new tag.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const createTag = async (request, response, next) => {
    const value = await dtoValidator(CreateTagDto, request, response);
    if (!value) {
        return;
    }

    const tag = await new CreateTagUseCase()
        .execute(value);

    if (tag) {
        response.status(201).json({
            data: tag,
        });
    } else {
        response.status(409).json({
            errors: [
                {
                    status: '409',
                    source: { pointer: '/data/attributes/body/text' },
                    title: 'Conflict',
                    detail: 'The provided entity already exists',
                },
            ],
        });
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

    const tag = await new DeleteTagUseCase()
        .execute(value);

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
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogsByTagId = async (request, response, next) => {
    const value = await dtoValidator(GetTagDto, request, response);
    if (!value) {
        return;
    }

    const logs = await new GetLogsByTagUseCase()
        .execute(value);

    if (logs === null) {
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
            data: logs,
        });
    }
};

/**
 * Get all Runs with tag.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getRuns = (request, response, next) => {
    response.status(501).json({
        errors: [
            {
                status: '501',
                title: 'Not implemented',
            },
        ],
    });
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

    const { count, tags } = await new GetAllTagsUseCase()
        .execute(value);

    const { query: { page: { limit = 100 } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: tags,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Patch tag on log.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const patchLog = (request, response, next) => {
    response.status(501).json({
        errors: [
            {
                status: '501',
                title: 'Not implemented',
            },
        ],
    });
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

    const tag = await new GetTagUseCase()
        .execute(value);

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

module.exports = {
    createTag,
    deleteTag,
    getLogsByTagId,
    getRuns,
    getTagById,
    listTags,
    patchLog,
};
