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

/* eslint-disable jsdoc/require-param */

const Joi = require('joi');
const { ApiConfig } = require('../../config/index.js');
const { DtoFactory, tokenSchema } = require('../../domain/dtos/DtoFactory');
const { dataPassService } = require('../services/dataPasses/DataPassService.js');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const PaginationDto = require('../../domain/dtos/PaginationDto.js');
const { NON_PHYSICS_PRODUCTIONS_NAMES_WORDS } = require('../../domain/enums/NonPhysicsProductionsNamesRoles.js');

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
                include: Joi.object({ byName: Joi.string().custom((value, helper) => {
                    if (value.length > 10) {
                        return helper.error('byName cannot have more than 10 characters');
                    }
                    const nameTokens = value?.split(',');
                    const allTokensCorrect = nameTokens.every((token) => NON_PHYSICS_PRODUCTIONS_NAMES_WORDS.includes(token));
                    if (!allTokensCorrect) {
                        return helper.error(`All byName must comma delimited list of ${NON_PHYSICS_PRODUCTIONS_NAMES_WORDS}`);
                    }
                }) }),
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

/**
 * Freeze the given data pass
 */
const freezeHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({ dataPassId: Joi.number().required() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            await dataPassService.setFrozenState({ id: validatedDTO.query.dataPassId }, true);
            res.sendStatus(204);
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * Un-freeze the given data pass
 * @param {import('express').Request} req the request object
 * @param {import('express').Response} res the response object
 * @returns {Promise<void>} resolves once the operation is done
 */
const unfreezeHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({ dataPassId: Joi.number().required() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            await dataPassService.setFrozenState({ id: validatedDTO.query.dataPassId }, false);
            res.sendStatus(204);
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * Set given data pass (for PROTON_PROTON runs) as skimmable
 * @param {import('express').Request} req the request object
 * @param {import('express').Response} res the response object
 * @returns {Promise<void>} resolves once the operation is done
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
            res.sendStatus(204);
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * Fetch skimmable runs list with information whether they are ready for skimming
 * @param {import('express').Request} req the request object
 * @param {import('express').Response} res the response object
 * @returns {Promise<void>} resolves once the operation is done
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

/**
 * Update ready_for_skimming status of given runs
 * @param {import('express').Request} req the request object
 * @param {import('express').Response} res the response object
 * @returns {Promise<void>} resolves once the operation is done
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
    freezeHandler,
    unfreezeHandler,
    markAsSkimmableHandler,
    fetchSkimmableRunsHandler,
    updateReadyForSkimmingRunsHandler,
};
