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
    environment: {
        CreateEnvironmentUseCase,
        UpdateEnvironmentUseCase,
        GetAllEnvironmentsUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        CreateEnvironmentDto,
        UpdateEnvironmentDto,
        GetEnvironmentDto,
        GetAllEnvironmentsDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');
const { ApiConfig } = require('../../config/index.js');
const { environmentService } = require('../services/environment/EnvironmentService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { DtoFactory } = require('../../domain/dtos/DtoFactory.js');
const Joi = require('joi');
const { logService } = require('../services/log/LogService.js');

/**
 * Creation of a new environment
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const createEnvironment = async (request, response, next) => {
    const value = await dtoValidator(CreateEnvironmentDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new CreateEnvironmentUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Update an existing environment
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const updateEnvironment = async (request, response, next) => {
    const value = await dtoValidator(UpdateEnvironmentDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateEnvironmentUseCase()
        .execute(value);
    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Creation of a new environment
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getAllEnvironments = async (request, response, next) => {
    const value = await dtoValidator(GetAllEnvironmentsDto, request, response);
    if (!value) {
        return;
    }

    const { count, environments } = await new GetAllEnvironmentsUseCase().execute(value);

    const { query: { page: { limit = ApiConfig.pagination.limit } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: environments,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Creation of a new environment
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getEnvironmentById = async (request, response) => {
    const dto = await dtoValidator(GetEnvironmentDto, request, response);
    if (!dto) {
        return;
    }
    const { params: { envId } } = dto;

    try {
        const environment = await environmentService.getOrFail(envId);
        response.status(200).json({ data: environment });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Route to fetch all the logs for a given environment
 */
const getAllEnvironmentLogsHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.paramsOnly({ envId: Joi.string().required() }),
        request,
        response,
    );

    if (requestDto) {
        try {
            const data = await logService.getAllByEnvironment(requestDto.params.envId);
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

module.exports = {
    createEnvironment,
    updateEnvironment,
    getAllEnvironments,
    getEnvironmentById,
    getAllEnvironmentLogsHandler,
};
