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

const { dtos: { GetAllRunTypesDto, GetRunTypeDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');
const { runTypeService } = require('../services/runType/RunTypeService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');

/**
 * Get all run types.
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

    try {
        response.status(200).json({ data: await runTypeService.getAll() });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Get a run type.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getRunTypeById = async (request, response) => {
    const value = await dtoValidator(GetRunTypeDto, request, response);
    if (!value) {
        return;
    }

    try {
        response.status(200).json({ data: await runTypeService.getOneOrFail({ id: value.params.runTypeId }) });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    listRunTypes,
    getRunTypeById,
};
