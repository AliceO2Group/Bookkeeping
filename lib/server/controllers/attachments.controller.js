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
const { dtos: { CreateAttachmentDto, GetAttachmentDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');
const { attachmentService } = require('../services/attachment/AttachmentService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');

/**
 * Create new attachment on log
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const createAttachment = async (request, response) => {
    const value = await dtoValidator(CreateAttachmentDto, request, response);
    if (!value) {
        return;
    }

    try {
        const { files: [file], body: { log: logId } } = value;
        response.status(201).json({ data: await attachmentService.create(file, logId) });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

/**
 * Send the file of an attachment
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const readAttachment = async (request, response) => {
    const value = await dtoValidator(GetAttachmentDto, request, response);
    if (!value) {
        return;
    }

    try {
        const { params: { attachmentId } } = value;
        const attachment = await attachmentService.getOneOrFail(attachmentId);
        response.status(200).sendFile(attachment.path);
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    createAttachment,
    readAttachment,
};
