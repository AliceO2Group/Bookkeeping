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
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const PaginationDto = require('../../domain/dtos/PaginationDto.js');

// eslint-disable-next-line valid-jsdoc
/**
 * List All LHC Periods with statistics
 */
const listLhcPeriodStatisticsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                ids: Joi.array().items(Joi.number()),
                names: Joi.array().items(Joi.string()),
                years: Joi.array().items(Joi.number()),
                beamTypes: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'name', 'avgCenterOfMassEnergy', 'year', 'beamTypes']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { filter, page: { limit = ApiConfig.pagination.limit, offset } = {}, sort = { name: 'DESC' } } = validatedDTO.query;
            const { count, rows: items } = await lhcPeriodStatisticsService.getAllForPhysicsRuns({
                filter,
                limit,
                offset,
                sort,
            });
            res.json(countedItemsToHttpView({ count, items }, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Get one LHC Period with given id with statistics
 */
const getLhcPeriodStatsticsByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({
            lhcPeriodId: Joi.number().required(),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const periodData = await lhcPeriodStatisticsService.getOneOrFail({ id: validatedDTO.params.lhcPeriodId });
            res.json({ data: periodData });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.LhcPeriodStatisticsController = {
    listLhcPeriodStatisticsHandler,
    getLhcPeriodStatsticsByIdHandler,
};
