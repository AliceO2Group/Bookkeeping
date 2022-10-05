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
    dtos: {
        UpdateLhcFillDto,
        GetAllLhcFillsDto,
        GetLhcFillDto,
        GetLhcFillRunDto,
        CreateLhcFillDto,
    },
} = require('../../domain');
const {
    lhcFill: {
        CreateLhcFillUseCase,
        GetAllLhcFillsUseCase,
        UpdateLhcFillUseCase,
        GetLhcFillUseCase,
        GetLhcFillRunsUseCase,
        GetLhcFillRunByRunNumberUseCase,
    },
} = require('../../usecases');
const { dtoValidator } = require('../utilities');
const { ApiConfig } = require('../../config/index.js');

/**
 * Create a new lhcFill
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const createLhcFill = async (request, response) => {
    const value = await dtoValidator(CreateLhcFillDto, request, response);

    if (!value) {
        return;
    }

    const { result, error } = await new CreateLhcFillUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Create a new lhcFill
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listLhcFills = async (request, response) => {
    const value = await dtoValidator(GetAllLhcFillsDto, request, response);
    if (!value) {
        return;
    }
    const { count, lhcFills } = await new GetAllLhcFillsUseCase()
        .execute(value);

    const { query: { page: { limit = ApiConfig.pagination.limit } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: lhcFills,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Create a new lhcFill
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const updateLhcFills = async (request, response) => {
    const value = await dtoValidator(UpdateLhcFillDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateLhcFillUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Create a new lhcFill
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getLhcFillById = async (request, response) => {
    const value = await dtoValidator(GetLhcFillDto, request, response);

    if (!value) {
        return;
    }

    const lhcFill = await new GetLhcFillUseCase()
        .execute(value);

    if (lhcFill === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `LhcFill with this id (${value.params.fillNumber}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: lhcFill,
        });
    }
};

/**
 * Create a new lhcFill
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listRuns = async (request, response) => {
    const value = await dtoValidator(GetLhcFillDto, request, response);
    if (!value) {
        return;
    }
    const result = await new GetLhcFillRunsUseCase()
        .execute(value);

    response.status(200).json({ data: result });
};

/**
 * Create a new lhcFill
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getRunByRunNumber = async (request, response) => {
    const value = await dtoValidator(GetLhcFillRunDto, request, response);
    if (!value) {
        return;
    }

    const run = await new GetLhcFillRunByRunNumberUseCase()
        .execute(value);

    if (run === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `The lhcFill (${value.params.fillNumber}) does not contain the run with run number (${value.params.runNumber})`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: run,
        });
    }
};

module.exports = {
    createLhcFill,
    listLhcFills,
    updateLhcFills,
    listRuns,
    getRunByRunNumber,
    getLhcFillById,
};
