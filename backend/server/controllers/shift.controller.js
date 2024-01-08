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
const { shiftService } = require('../services/shift/ShiftService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { GetShiftDataDto } = require('../../domain/dtos/shift/GetShiftDataDto.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Route to fetch shift data
 */
const getShiftDataHandler = async (request, response) => {
    const requestDto = await dtoValidator(GetShiftDataDto, request, response);
    if (requestDto) {
        const userIdentifier = { externalUserId: requestDto?.session?.externalId };

        try {
            const data = await shiftService.getShiftData(userIdentifier, requestDto.query.shiftType);
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

exports.ShiftController = {
    getShiftDataHandler,
};
