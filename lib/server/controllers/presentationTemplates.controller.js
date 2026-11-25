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

const { dtos: { GetAllPresentationTemplatesDto, GetPresentationTemplateDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');
const { presentationTemplateService } = require('../services/presentationTemplate/PresentationTemplateService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');

/**
 * Get all presentation templates.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listPresentationTemplates = async (request, response) => {
    const value = await dtoValidator(GetAllPresentationTemplatesDto, request, response);
    if (!value) {
        return;
    }

    try {
        response.status(200).json({ data: await presentationTemplateService.getAll() });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Get a presentation template with its modules.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const getPresentationTemplateById = async (request, response) => {
    const value = await dtoValidator(GetPresentationTemplateDto, request, response);
    if (!value) {
        return;
    }

    try {
        response.status(200).json({ data: await presentationTemplateService.getOneOrFail(value.params.presentationTemplateId) });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    listPresentationTemplates,
    getPresentationTemplateById,
};
