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
    run: {
        EndRunUseCase,
        GetAllReasonTypesUseCase,
        GetAllRunsUseCase,
        GetFlpsByRunUseCase,
        GetLogsByRunUseCase,
        GetRunUseCase,
        StartRunUseCase,
        UpdateRunTagsUseCase,
        UpdateRunUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        EndRunDto,
        GetAllRunsDto,
        GetRunDto,
        UpdateRunByRunNumberDto,
        UpdateRunTagsDto,
        StartRunDto,
        UpdateRunDto,
    },
} = require('../../domain');
const { dtoValidator, fromToValidator } = require('../utilities');

/**
 * Get all runs.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const listRuns = async (request, response, next) => {
    const value = await dtoValidator(GetAllRunsDto, request, response);
    if (!value) {
        return;
    }
    const start = fromToValidator('start', value?.query?.filter?.o2start);
    const stop = fromToValidator('stop', value?.query?.filter?.o2end);
    if (start.length > 0 || stop.length > 0) {
        const errors = [];
        errors.push(...start, ...stop);
        return response.status(400).json({
            errors: errors,
        });
    }
    const { count, runs } = await new GetAllRunsUseCase()
        .execute(value);

    const { query: { page: { limit = 100 } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: runs,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Get run.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getRunById = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const run = await new GetRunUseCase()
        .execute(value);

    if (run === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Run with this id (${value.params.runId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: run,
        });
    }
};

/**
 * Get all logs with run.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogsByRunId = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const logs = await new GetLogsByRunUseCase()
        .execute(value);

    if (logs === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Run with this id (${value.params.runId}) could not be found`,
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
 * Get all logs with run.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getFlpsByRunId = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const flps = await new GetFlpsByRunUseCase()
        .execute(value);

    if (flps === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Run with this id (${value.params.runId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: flps,
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
const listTagsByRunId = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const run = await new GetRunUseCase()
        .execute(value);

    if (run === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Run with this id (${request.params.RunId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: run.tags,
        });
    }
};

/**
 * Update (overwrite) tags of specified run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {void}
 */
const updateRunTags = async (request, response, next) => {
    const value = await dtoValidator(UpdateRunTagsDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateRunTagsUseCase().execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(200).json({ data: result });
    }
};

/**
 * Create a new Run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const startRun = async (request, response, next) => {
    const value = await dtoValidator(StartRunDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new StartRunUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Edit end time of a run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const endRun = async (request, response, next) => {
    const value = await dtoValidator(EndRunDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new EndRunUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Update the fields of a run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const updateRun = async (request, response, next) => {
    const value = await dtoValidator(UpdateRunDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateRunUseCase().execute(value);
    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Update the fields of a run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const updateRunByRunNumber = async (request, response, next) => {
    const value = await dtoValidator(UpdateRunByRunNumberDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateRunUseCase().execute(value);
    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(200).json({ data: result });
    }
};

/**
 * Retrieve a list of reason types objects
 *
 * @param {Object} _request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} _next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const listReasonTypes = async (_request, response, _next) => {
    try {
        const reasonTypes = await new GetAllReasonTypesUseCase().execute();
        if (reasonTypes && reasonTypes.length > 0) {
            response.status(200).json({ data: reasonTypes });
        } else {
            response.status(204).json({ data: [] });
        }
    } catch (error) {
        response.status(502).json({ errors: ['Unable to retrieve list of reason types'] });
    }
};

module.exports = {
    endRun,
    getRunById,
    getLogsByRunId,
    getFlpsByRunId,
    listReasonTypes,
    listRuns,
    listTagsByRunId,
    startRun,
    updateRunByRunNumber,
    updateRunTags,
    updateRun,
};
