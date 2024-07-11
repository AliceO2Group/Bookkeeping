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
const { DtoFactory, tokenSchema } = require('../../domain/dtos/DtoFactory');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { PaginationDto } = require('../../domain/dtos');
const { ApiConfig } = require('../../config');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView');
const { qcFlagService } = require('../services/qualityControlFlag/QcFlagService.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Get one QC Flag by its id
 */
const getQcFlagByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({ id: Joi.number() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const qcFlag = await qcFlagService.getOneOrFail(validatedDTO.params.id);
            res.json({ data: qcFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List All QcFlags for a given data pass
 */
const listQcFlagsPerDataPassHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            dataPassId: Joi.number(),
            runNumber: Joi.number(),
            dplDetectorId: Joi.number(),
            page: PaginationDto,
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                dataPassId,
                runNumber,
                dplDetectorId,
                page: { limit = ApiConfig.pagination.limit, offset } = {},
            } = validatedDTO.query;

            const { count, rows: items } = await qcFlagService.getAllPerDataPassAndRunAndDetector(
                { dataPassId, runNumber, dplDetectorId },
                { limit, offset },
            );
            res.json(countedItemsToHttpView({ count, items }, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List All QcFlags for a given data pass
 */
const listQcFlagsPerSimulationPassHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            simulationPassId: Joi.number(),
            runNumber: Joi.number(),
            dplDetectorId: Joi.number(),
            page: PaginationDto,
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                simulationPassId,
                runNumber,
                dplDetectorId,
                page: { limit = ApiConfig.pagination.limit, offset } = {},
            } = validatedDTO.query;

            const { count, rows: items } = await qcFlagService.getAllPerSimulationPassAndRunAndDetector(
                { simulationPassId, runNumber, dplDetectorId },
                { limit, offset },
            );
            res.json(countedItemsToHttpView({ count, items }, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Create QcFlag
 */
const createQcFlagHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly(Joi.object({
            from: Joi.number().required().allow(null),
            to: Joi.number().required().allow(null),
            comment: Joi.string().optional().allow(null),
            flagTypeId: Joi.number().required(),
            runNumber: Joi.number().required(),
            dplDetectorId: Joi.number().required(),
            dataPassId: Joi.number(),
            simulationPassId: Joi.number(),
        }).xor('dataPassId', 'simulationPassId')),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                from,
                to,
                comment,
                flagTypeId,
                runNumber,
                dplDetectorId,
                dataPassId,
                simulationPassId,
            } = validatedDTO.body;
            const qcFlag = { from, to, flagTypeId, comment };
            const scope = {
                runNumber,
                dplDetectorIdentifier: { dplDetectorId },
                dataPassIdentifier: dataPassId ? { id: dataPassId } : null,
                simulationPassIdentifier: simulationPassId ? { id: simulationPassId } : null,
            };
            const relations = {
                user: {
                    externalUserId: validatedDTO.session.externalId,
                    roles: validatedDTO.session.access,
                },
            };

            const [createdFlag] = await qcFlagService.create([qcFlag], scope, relations);
            res.status(201).json({ data: createdFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Delete one QC Flag by its id
 */
const deleteQcFlagByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({ id: Joi.number() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const qcFlag = await qcFlagService.delete(validatedDTO.params.id);
            res.json({ data: qcFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Verify QcFlag
 */
const verifyQcFlagHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        Joi.object({
            params: Joi.object({
                id: Joi.number().required(),
            }),
            body: Joi.object({
                comment: Joi.string().optional().allow(null),
            }),
            query: tokenSchema,
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const parameters = {
                flagId: validatedDTO.params.id,
                comment: validatedDTO.body.comment,
            };
            const user = {
                externalUserId: validatedDTO.session.externalId,
                roles: validatedDTO.session.access,
            };

            const verifiedFlag = await qcFlagService.verifyFlag(parameters, { user });
            res.status(201).json({ data: verifiedFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Get QC flags summary for data/simulation pass
 */
const getQcFlagsSummaryHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly(Joi.object({
            dataPassId: Joi.number(),
            simulationPassId: Joi.number(),
        }).xor('dataPassId', 'simulationPassId')),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                dataPassId,
                simulationPassId,
            } = validatedDTO.query;

            const data = await qcFlagService.getQcFlagsSummary({ dataPassId, simulationPassId });
            res.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.QcFlagController = {
    getQcFlagByIdHandler,
    listQcFlagsPerDataPassHandler,
    listQcFlagsPerSimulationPassHandler,
    createQcFlagHandler,
    deleteQcFlagByIdHandler,
    verifyQcFlagHandler,
    getQcFlagsSummaryHandler,
};
