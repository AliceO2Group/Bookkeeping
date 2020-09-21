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
    },
} = require('../../usecases');
const {
    dtos: {
        GetAllFlpsDto,
        GetFlpDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');

/**
 * Get all flps.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const listFlps = async (request, response, next) => {
    const value = await dtoValidator(GetAllFlpsDto, request, response);
    if (!value) {
        return;
    }

    const { count, flps } = await new GetAllFlpsUseCase()
        .execute(value);

    const { query: { page: { limit = 100 } = {} } } = value;
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
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getFlpById = async (request, response, next) => {
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
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogsByFlpId = async (request, response, next) => {
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

module.exports = {
    getFlpById,
    listFlps,
    getLogsByFlpId,
};