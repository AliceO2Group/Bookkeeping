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
const { attachment: { CreateAttachmentUseCase, GetAttachmentUseCase } } = require('../../usecases');
const { dtos: { CreateAttachmentDto, GetAttachmentDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');

/**
 * Create new attachment on log
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const createAttachment = async (request, response) => {
    const value = await dtoValidator(CreateAttachmentDto, request, response);
    if (!value) {
        return;
    }

    const attachment = await new CreateAttachmentUseCase().execute(value);

    response.status(201).json({
        data: attachment,
    });
};

/**
 * Find all Attachments that belong to a certain log item
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const readAttachment = async (request, response, next) => {
    const value = await dtoValidator(GetAttachmentDto, request, response);
    if (!value) {
        return;
    }

    const { attachment } = await new GetAttachmentUseCase()
        .execute(value);
    if (!attachment) {
        response.status(400).json({
            errors: [
                {
                    status: '404',
                    title: `Attachment with this id (${request.params.attachmentId}) could not be found`,
                },
            ],
        });
        return;
    }
    response.status(200).sendFile(attachment.path);
};

module.exports = {
    createAttachment,
    readAttachment,
};
