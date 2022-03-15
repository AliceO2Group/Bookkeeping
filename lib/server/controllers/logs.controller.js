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
    log: {
        CreateLogUseCase,
        GetAllLogsUseCase,
        GetAllLogAttachmentsUseCase,
        GetLogAttachmentUseCase,
        GetLogUseCase,
        GetLogTreeUseCase,
    } } = require('../../usecases');
const {
    dtos: {
        CreateLogDto,
        GetAllLogsDto,
        GetAllLogAttachmentsDto,
        GetLogAttachmentDto,
        GetLogDto,
    } } = require('../../domain');
const { dtoValidator } = require('../utilities');

const { Notification } = require('../../config');

const notification = Notification.brokers ? new (require('@aliceo2/web-ui').NotificationService)(Notification) : null;

/**
 * Create a new log
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const createLog = async (request, response, next) => {
    const value = await dtoValidator(CreateLogDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new CreateLogUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
        const url = `${request.protocol}://${request.get('host')}?page=log-detail&id=${result.id}`;
        const tags = result.tags.map((tag) => tag.text);
        if (notification?.isConfigured()) {
            notification.send(tags, result.title, url, result.text);
        }
    }
};

/**
 * Get all attachments from log
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getAllAttachments = async (request, response, next) => {
    const value = await dtoValidator(GetAllLogAttachmentsDto, request, response);
    if (!value) {
        return;
    }

    const attachments = await new GetAllLogAttachmentsUseCase()
        .execute(value);

    if (attachments) {
        response.json({ data: attachments });
    } else {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Log with this id (${request.params.logId}) could not be found`,
                },
            ],
        });
    }
};

/**
 * Get attachment from log
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getAttachment = async (request, response, next) => {
    const dto = await dtoValidator(GetLogAttachmentDto, request, response);
    if (!dto) {
        return;
    }

    const { result, error } = await new GetLogAttachmentUseCase()
        .execute(dto);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
        return;
    }

    response.status(200).sendFile(result.path);
};

/**
 * Get all logs.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const listLogs = async (request, response, next) => {
    const value = await dtoValidator(GetAllLogsDto, request, response);
    if (!value) {
        return;
    }

    const { count, logs } = await new GetAllLogsUseCase()
        .execute(value);

    const { query: { page: { limit = 100 } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: logs,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Get the Log tree for a given Log.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogTree = async (request, response, next) => {
    const value = await dtoValidator(GetLogDto, request, response);
    if (!value) {
        return;
    }

    const log = await new GetLogTreeUseCase()
        .execute(value);

    if (log === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Log with this id (${request.params.logId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: log,
        });
    }
};

/**
 * Lists all tags associated with a log.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const listTagsByLogId = async (request, response, next) => {
    const value = await dtoValidator(GetLogDto, request, response);
    if (!value) {
        return;
    }

    const log = await new GetLogUseCase()
        .execute(value);

    if (log === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Log with this id (${request.params.logId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: log.tags,
        });
    }
};

/**
 * Patch run on log.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const patchRun = (request, response, next) => {
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
 * Get log.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogById = async (request, response, next) => {
    const value = await dtoValidator(GetLogDto, request, response);
    if (!value) {
        return;
    }

    const log = await new GetLogUseCase()
        .execute(value);

    if (log === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Log with this id (${value.params.logId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: log,
        });
    }
};

module.exports = {
    createLog,
    getAllAttachments,
    getAttachment,
    listLogs,
    listTagsByLogId,
    getLogById,
    getLogTree,
    patchRun,
};
