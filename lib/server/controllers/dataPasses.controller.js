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
const { DtoFactory, tokenSchema } = require('../../domain/dtos/DtoFactory');
const { dataPassService } = require('../services/dataPasses/DataPassService.js');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const PaginationDto = require('../../domain/dtos/PaginationDto.js');

// eslint-disable-next-line valid-jsdoc
/**
 * List All DataPasses with statistics
 */
const listDataPassesHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                simulationPassIds: Joi.array().items(Joi.number()),
                lhcPeriodIds: Joi.array().items(Joi.number()),
                ids: Joi.array().items(Joi.number()),
                names: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'name']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { filter, page: { limit = ApiConfig.pagination.limit, offset } = {}, sort = { name: 'DESC' } } = validatedDTO.query;
            const { count, rows: items } = await dataPassService.getAll({
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
 * Set given data pass (for PROTON_PROTON runs) as skimmable
 */
const markAsSkimmableHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({ dataPassId: Joi.number().required() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            await dataPassService.markAsSkimmable({ id: validatedDTO.query.dataPassId });
            res.send(200);
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Fetch skimmable runs list with information whether they are ready for skimming
 */
const fetchSkimmableRunsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({ dataPassId: Joi.number().required() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const data = await dataPassService.getSkimmableRuns({ id: validatedDTO.query.dataPassId });
            res.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Update ready_for_skimming status of given runs
 */
const updateReadyForSkimmingRunsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        Joi.object({
            query: tokenSchema.concat(Joi.object({ dataPassId: Joi.number().required() })),
            body: Joi.object({ data: Joi.array().items(Joi.object({
                runNumber: Joi.number().integer().positive().required(),
                readyForSkimming: Joi.boolean().required().allow(null),
            })).required() }).required(),
            params: Joi.object({}),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const data = await dataPassService.updateReadyForSkimmingRuns({ id: validatedDTO.query.dataPassId }, validatedDTO.body.data);
            res.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.DataPassesController = {
    listDataPassesHandler,
    markAsSkimmableHandler,
    fetchSkimmableRunsHandler,
    updateReadyForSkimmingRunsHandler,
};
