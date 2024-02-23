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
const { simulationPassService } = require('../services/simulationPasses/SimulationPassService.js');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const PaginationDto = require('../../domain/dtos/PaginationDto.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Get one simulation pass by id
 */
const getSimulationPassByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({ id: Joi.number() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const simulationPass = await simulationPassService.getOneOrFail({ id: validatedDTO.params.id });
            res.json({ data: simulationPass });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List All SimulationPasss with statistics
 */
const listSimulationPassesHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                lhcPeriodIds: Joi.array().items(Joi.string()),
                dataPassIds: Joi.array().items(Joi.string()),
                ids: Joi.array().items(Joi.number()),
                names: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'name', 'pwg', 'jiraId', 'requestedEventsCount', 'generatedEventsCount', 'outputSize']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { filter, page: { limit = ApiConfig.pagination.limit, offset } = {}, sort = { name: 'DESC' } } = validatedDTO.query;
            const { count, rows: items } = await simulationPassService.getAll({
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

exports.SimulationPassesController = {
    getSimulationPassByIdHandler,
    listSimulationPassesHandler,
};
