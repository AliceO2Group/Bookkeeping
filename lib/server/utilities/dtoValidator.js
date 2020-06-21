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

/**
 * Validates a request using the provided DTO. If the validation fails it will send an error response to the requestor.
 *
 * @param {Object} dto The *dto* object represents the DTO that is used to validate the incoming request.
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Object} Returns the validated value or null if an error occurred.
 */
const dtoValidator = async (dto, { body, params, query, session }, response) => {
    let value = null;

    try {
        value = await dto.validateAsync({ body, params, query }, {
            abortEarly: false,
        });
        value.session = session;
    } catch (err) {
        const { details } = err;
        response.status(400).json({
            errors: details.map((error) => ({
                status: '422',
                source: { pointer: `/data/attributes/${error.path.join('/')}` },
                title: 'Invalid Attribute',
                detail: error.message,
            })),
        });
    }

    return value;
};

module.exports = dtoValidator;
