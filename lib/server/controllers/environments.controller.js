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
const { transitionToErrorLostEnvironments } = require('../services/environment/transitionToErrorLostEnvironments.js');
const { setO2StopOfLostRuns } = require('../services/run/setO2StopOfLostRuns.js');
const { buildUrl } = require('../../utilities/buildUrl.js');
const { services } = require('../../config/services.js');

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
        const environments = await environmentService.getOrFail(envId);
        response.status(200).json({ data: environments });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};


module.exports = {
    createEnvironment,
    updateEnvironment,
    getAllEnvironments,
    getEnvironmentById,
};
