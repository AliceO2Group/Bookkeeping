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
        GetAllRunsUseCase,
        GetRunUseCase,
        GetLogsByRunUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        GetAllRunsDto,
        GetRunDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');

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

module.exports = {
    getRunById,
    listRuns,
    getLogsByRunId,
};
