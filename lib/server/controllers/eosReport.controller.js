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
const { dtoValidator } = require('../utilities/index.js');
const { CreateEosReportDto } = require('../../domain/dtos/eosReport/CreateEosReportDto.js');
const { eosReportService } = require('../services/eosReport/EosReportService.js');
const { shiftService } = require('../services/shift/ShiftService.js');

/**
 * Route handler to create an EOS report log entry
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const createEosReportHandler = async (request, response) => {
    const value = await dtoValidator(CreateEosReportDto, request, response);

    const userIdentifier = { externalUserId: value?.session?.externalId };

    if (value) {
        const content = await eosReportService.createLogEntry(
            value.query.reportType,
            {
                shiftStart: (await shiftService.getUserPendingShiftOrFail(userIdentifier)).start,
                ...value.body,
            },
            userIdentifier,
        );
        response.status(201).json({ data: content });
    }
};

exports.EosReportController = {
    createEosReportHandler,
};
