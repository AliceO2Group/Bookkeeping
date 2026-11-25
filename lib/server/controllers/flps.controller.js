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
        GetAllFlpsDto,
        GetFlpDto,
        CreateFlpDto,
        UpdateFlpDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');
const { ApiConfig } = require('../../config/index.js');
const { flpRoleService } = require('../services/flp/FlpRoleService.js');
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
        const { query: { page: { limit = ApiConfig.pagination.limit, offset } = {}, sort } } = value;
        const { count, rows } = await flpRoleService.getAll({ limit, offset, sort });

        response.status(200).json({
            data: rows,
            meta: {
                page: {
                    pageCount: Math.ceil(count / limit),
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
        response.status(200).json({ data: await flpRoleService.getOneOrFail({ flpRoleId: value.params.flpId }) });
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
        response.status(201).json({ data: await flpRoleService.create(value.body) });
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
        const { params: { flpName, runNumber }, body } = value;
        response.status(201).json({ data: await flpRoleService.update({ flpName, runNumber }, body) });
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
