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
const { ApiConfig } = require('../../config/index.js');
const { DtoFactory } = require('../../domain/dtos/DtoFactory');
const { lhcPeriodStatisticsService } = require('../services/lhcPeriod/LhcPeriodStatisticsService.js');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { countedDataToHttpView } = require('../utilities/countedDataToHttpView.js');
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
                ids: Joi.array().items(Joi.number()),
                names: Joi.array().items(Joi.string()),
            },
            page: DtoFactory.StdPaginationDto,
            sort: DtoFactory.createStdSortDto(['id', 'name']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { filter, page: { limit = ApiConfig.pagination.limit, offset } = {}, sort } = validatedDTO.query;
            const periodsData = await lhcPeriodStatisticsService.getAllForPhysicsRuns({
                filter,
                limit,
                offset,
                sort,
            });
            res.json(countedDataToHttpView(periodsData, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * Get one lhcPeriods with given id
 * @param {Object} req express HTTP request object
 * @param {Object} res express HTTP response object
 * @param {Object} next express next handler
 * @returns {undefined}
 */
const getLhcPeriodByIdHandler = async (req, res, next) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({
            lhcPeriodId: Joi.number().required(),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const periodData = await lhcPeriodStatisticsService.getByIdentifier({ id: validatedDTO.params.lhcPeriodId });
            if (periodData) {
                res.json({ data: periodData });
            } else {
                res.status(404).json({
                    errors: [
                        {
                            status: '404',
                            title: `Lhc period with this id (${validatedDTO.params.lhcPeriodId}) could not be found`,
                        },
                    ],
                });
            }
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.LhcPeriodStatisticsController = {
    listLhcPeriodsHandler: listPeriodStatisticsHandler,
    getLhcPeriodByIdHandler,
};
