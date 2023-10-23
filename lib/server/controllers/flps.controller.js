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
    flp: {
        GetAllFlpsUseCase,
        GetFlpUseCase,
        GetLogsByFlpUseCase,
        CreateFlpUseCase,
        UpdateFlpUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        GetAllFlpsDto,
        GetFlpDto,
        CreateFlpDto,
        UpdateFlpDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');
const { ApiConfig } = require('../../config/index.js');

/**
 * Get all flps.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listFlps = async (request, response) => {
    const value = await dtoValidator(GetAllFlpsDto, request, response);
    if (!value) {
        return;
    }

    const { count, flps } = await new GetAllFlpsUseCase()
        .execute(value);

    const { query: { page: { limit = ApiConfig.pagination.limit } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: flps,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Get flp.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getFlpById = async (request, response) => {
    const value = await dtoValidator(GetFlpDto, request, response);
    if (!value) {
        return;
    }

    const flp = await new GetFlpUseCase()
        .execute(value);

    if (flp === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Flp with this id (${value.params.flpId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: flp,
        });
    }
};

/**
 * Get all logs with flp.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getLogsByFlpId = async (request, response) => {
    const value = await dtoValidator(GetFlpDto, request, response);
    if (!value) {
        return;
    }

    const logs = await new GetLogsByFlpUseCase()
        .execute(value);

    if (logs === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Flp with this id (${value.params.flpId}) could not be found`,
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
 * Create a new flp.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const create = async (request, response) => {
    const value = await dtoValidator(CreateFlpDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new CreateFlpUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Update flp.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const update = async (request, response) => {
    const value = await dtoValidator(UpdateFlpDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateFlpUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

module.exports = {
    getFlpById,
    listFlps,
    getLogsByFlpId,
    create,
    update,
};
