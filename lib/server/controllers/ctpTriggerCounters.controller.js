/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { dtoValidator } = require('../utilities');
const { DtoFactory } = require('../../domain/dtos/DtoFactory');
const EntityIdDto = require('../../domain/dtos/EntityIdDto.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { ctpTriggerCountersService } = require('../services/ctpTriggerCounters/CtpTriggerCountersService');

/**
 * Return all the trigger counters for a given run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const getAllCtpTriggerCountersForRunHandler = async (request, response) => {
    const requestDto = await dtoValidator(DtoFactory.paramsOnly({
        runNumber: EntityIdDto.required(),
    }), request, response);

    if (requestDto) {
        try {
            const data = await ctpTriggerCountersService.getPerRun(requestDto.params.runNumber);
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

module.exports = {
    getAllCtpTriggerCountersForRunHandler,
};
