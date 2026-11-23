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

const { dtos: { GetAllTemplatesDto, GetTemplateDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');
const { templateService } = require('../services/template/TemplateService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');

/**
 * Get all templates.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listTemplates = async (request, response) => {
    const value = await dtoValidator(GetAllTemplatesDto, request, response);
    if (!value) {
        return;
    }

    try {
        response.status(200).json({ data: await templateService.getAll() });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Get a template with its modules.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getTemplateById = async (request, response) => {
    const value = await dtoValidator(GetTemplateDto, request, response);
    if (!value) {
        return;
    }

    try {
        response.status(200).json({ data: await templateService.getOneOrFail(value.params.templateId) });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    listTemplates,
    getTemplateById,
};
