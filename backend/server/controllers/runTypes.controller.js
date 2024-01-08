/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const {
    runType: {
        GetAllRunTypesUseCase,
        GetRunTypeUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        GetAllRunTypesDto,
        GetRunTypeDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');
const { ApiConfig } = require('../../config/index.js');

/**
 * Get all runs.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listRunTypes = async (request, response) => {
    const value = await dtoValidator(GetAllRunTypesDto, request, response);
    if (!value) {
        return;
    }

    const { count, runTypes } = await new GetAllRunTypesUseCase()
        .execute(value);

    const { query: { page: { limit = ApiConfig.pagination.limit } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: runTypes,
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
const getRunTypeById = async (request, response) => {
    const value = await dtoValidator(GetRunTypeDto, request, response);
    if (!value) {
        return;
    }

    const runType = await new GetRunTypeUseCase()
        .execute(value);

    if (runType === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Run with this id (${value.params.runTypeId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: runType,
        });
    }
};

module.exports = {
    listRunTypes,
    getRunTypeById,
};
