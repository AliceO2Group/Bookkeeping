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

const { NotFoundError } = require('../errors/NotFoundError.js');

/**
 * Update (in place) the given Express response considering a given error
 * If the error is specific, the response status may be set to a specific error code
 *
 * @param {Object} response the express response
 * @param {Error} error the error to handle
 *
 * @return {void}
 */
const updateExpressResponseFromNativeError = (response, error) => {
    let status = 400;
    let title = 'Service unavailable';
    const { message } = error;

    if (error instanceof NotFoundError) {
        status = 404;
        title = 'Not found';
    }

    response.status(status).json({ errors: [{ status, title, detail: message || 'An error has occurred' }] });
};

exports.updateExpressResponseFromNativeError = updateExpressResponseFromNativeError;
