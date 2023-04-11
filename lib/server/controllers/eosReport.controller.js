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
const { CreateEosReportDto } = require('../../domain/dtos/eorReport/CreateEosReportDto.js');
const { eosReportService } = require('../services/eosReport/EosReportService.js');
const { shiftService } = require('../services/shift/ShiftService.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Route handler to create an EOS report log entry
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
