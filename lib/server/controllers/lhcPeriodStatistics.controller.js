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

const Joi = require('joi');
const { DtoFactory } = require('../../domain/dtos/DtoFactory');
const { lhcPeriodStatisticsService } = require('../services/lhcPeriod/LhcPeriodStatisticsService.js');
const { dtoValidator, findAndCountAllToHttpView } = require('../utilities');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');

/**
 * List All lhcPeriods with statistics
 * @param {Object} req express HTTP request object
 * @param {Object} res express HTTP response object
 * @param {Object} next express next handler
 * @returns {undefined}
 */
const listPeriodStatisticsHandler = async (req, res, next) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                ids: Joi.string().optional(),
                names: Joi.string().optional(),
            },
            page: DtoFactory.StdPaginationDto,
            sort: DtoFactory.StdSortDto(['id', 'name']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const periodsData = await lhcPeriodStatisticsService.getAllForPhysicsRuns(validatedDTO.query);
            res.json(findAndCountAllToHttpView(periodsData));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.LhcPeriodStatisticsController = {
    listPeriodsHandler: listPeriodStatisticsHandler,
};
