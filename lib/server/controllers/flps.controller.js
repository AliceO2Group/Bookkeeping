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
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');

/**
 * Get all flps.
 *
 * @param {Request} request the express request
 * @param {Response} response the express response
 * @returns {Promise<void>} resolves once the response is sent
 */
const listFlps = async (request, response) => {
    const value = await dtoValidator(GetAllFlpsDto, request, response);
    if (!value) {
        return;
    }

    try {
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
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Get flp.
 *
 * @param {Request} request the express request
 * @param {Response} response the express response
 * @returns {Promise<void>} resolves once the response is sent
 */
const getFlpById = async (request, response) => {
    const value = await dtoValidator(GetFlpDto, request, response);
    if (!value) {
        return;
    }

    try {
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
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Create a new flp.
 *
 * @param {Request} request the express request
 * @param {Response} response the express response
 * @returns {Promise<void>} resolves once the response is sent
 */
const create = async (request, response) => {
    const value = await dtoValidator(CreateFlpDto, request, response);
    if (!value) {
        return;
    }

    try {
        const { result, error } = await new CreateFlpUseCase()
            .execute(value);

        if (error) {
            response.status(Number(error.status)).json({ errors: [error] });
        } else {
            response.status(201).json({ data: result });
        }
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Update flp.
 *
 * @param {Request} request the express request
 * @param {Response} response the express response
 * @returns {Promise<void>} resolves once the response is sent
 */
const update = async (request, response) => {
    const value = await dtoValidator(UpdateFlpDto, request, response);
    if (!value) {
        return;
    }

    try {
        const { result, error } = await new UpdateFlpUseCase()
            .execute(value);

        if (error) {
            response.status(Number(error.status)).json({ errors: [error] });
        } else {
            response.status(201).json({ data: result });
        }
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    getFlpById,
    listFlps,
    create,
    update,
};
