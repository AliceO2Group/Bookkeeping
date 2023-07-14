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
const { DtoFactory } = require('../../domain/dtos/DtoFactory.js');
const Joi = require('joi');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { statisticsService } = require('../services/statistics/StatisticsService.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Route to get LHC fill statistics
 */
const getLhcFillStatisticsHandler = async (request, response) => {
    const requestDto = await dtoValidator(DtoFactory.queryOnly({
        from: Joi.date().required(),
        to: Joi.date().required(),
    }), request, response);

    if (requestDto) {
        try {
            const data = await statisticsService.getLhcFillStatistics({ from: requestDto.query.from, to: requestDto.query.to });
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

exports.StatisticsController = {
    getLhcFillStatisticsHandler,
};
