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
const { detectorService } = require('../services/detector/DetectorService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { UpdateRunDetectorDto } = require('../../domain/dtos');
const { UpdateRunDetectorUseCase } = require('../../usecases/runDetector');
const { dtoValidator } = require('../utilities');

/**
 * Update an existing detector
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const updateDetectorById = async (request, response) =>{
    const value = await dtoValidator(UpdateRunDetectorDto, request, response);
    if (!value) {
        return;
    }

    const { result, error } = await new UpdateRunDetectorUseCase()
        .execute(value);
    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: result });
    }
};

/**
 * Endpoint to list all the detectors
 *
 * @param {Object} _request the express request
 * @param {Object} response the express response
 * @return {void}
 */
const listAllDetectors = async (_request, response) => {
    try {
        const detectors = await detectorService.getAll();
        response.status(200).json({ data: detectors });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

module.exports = {
    updateDetectorById,
    listAllDetectors,
};
