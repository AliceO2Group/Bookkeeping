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
const { DtoFactory, tokenSchema } = require('../../domain/dtos/DtoFactory');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { PaginationDto } = require('../../domain/dtos');
const { ApiConfig } = require('../../config');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView');
const { qcFlagService } = require('../services/qualityControlFlag/QcFlagService.js');
const { gaqService } = require('../services/qualityControlFlag/GaqService.js');
const { qcFlagSummaryService } = require('../services/qualityControlFlag/QcFlagSummaryService.js');

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
                { dataPassId, runNumber, detectorId: dplDetectorId },
                { limit, offset },
            );
            res.json(countedItemsToHttpView({ count, items }, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

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
                { simulationPassId, runNumber, detectorId: dplDetectorId },
                { limit, offset },
            );
            res.json(countedItemsToHttpView({ count, items }, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * List All synchronous QcFlags for given run and detector
 */
const listSynchronousQcFlagsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: Joi.number(),
            detectorId: Joi.number(),
            page: PaginationDto,
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                runNumber,
                detectorId,
                page: { limit = ApiConfig.pagination.limit, offset } = {},
            } = validatedDTO.query;

            const { count, rows: items } = await qcFlagService.getAllSynchronousPerRunAndDetector(
                { runNumber, detectorId },
                { limit, offset },
            );
            res.json(countedItemsToHttpView({ count, items }, limit));
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * Create QcFlag
 */
const createQcFlagsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly(Joi.object({
            from: Joi.number().required().allow(null),
            to: Joi.number().required().allow(null),
            comment: Joi.string().optional().allow(null),
            flagTypeId: Joi.number().required(),
            runNumber: Joi.number().when('runDetectors', {
                is: Joi.exist(),
                then: Joi.forbidden().messages({
                    'any.unknown': 'runNumber is not allowed when runDetectors is provided.',
                }),
                otherwise: Joi.required(),
            }),
            dplDetectorId: Joi.number().when('runDetectors', {
                is: Joi.exist(),
                then: Joi.forbidden().messages({
                    'any.unknown': 'dplDetectorId is not allowed when runDetectors is provided.',
                }),
                otherwise: Joi.required(),
            }),
            dataPassId: Joi.number().allow(null),
            simulationPassId: Joi.number().allow(null),
            runDetectors: Joi.array().items(Joi.object({
                runNumber: Joi.number().required(),
                detectorIds: Joi.array().items(Joi.number().required()).min(1).required(),
            }).required()).optional(),
        })
            .xor('dataPassId', 'simulationPassId')),
        req,
        res,
    );

    if (validatedDTO) {
        try {
            const { runDetectors, ...flagData } = validatedDTO.body;

            // Transform runDetectors into individual flag objects
            const flags = runDetectors
                ? runDetectors.flatMap(({ runNumber, detectorIds }) =>
                    detectorIds.map((dplDetectorId) => ({
                        ...flagData,
                        runNumber,
                        dplDetectorId,
                    })))
                : [flagData];

            const createdFlags = [];
            const relations = {
                user: {
                    userId: validatedDTO.session.userId,
                    externalUserId: validatedDTO.session.externalId,
                    roles: validatedDTO.session.access,
                },
            };

            for (const flag of flags) {
                const scope = {
                    runNumber: flag.runNumber,
                    detectorIdentifier: { detectorId: flag.dplDetectorId },
                    dataPassIdentifier: flag.dataPassId ? { id: flag.dataPassId } : null,
                    simulationPassIdentifier: flag.simulationPassId ? { id: flag.simulationPassId } : null,
                };

                const [createdFlag] = await qcFlagService.create([flag], scope, relations);
                createdFlags.push(createdFlag);
            }

            res.status(201).json({ data: createdFlags });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

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

/**
 * Delete all QC flags related to a given data pass
 */
const deleteQcFlagsByDataPassHandler = async (req, res) => {
    const validatedDto = await dtoValidator(
        DtoFactory.queryOnly({ dataPassId: Joi.number() }),
        req,
        res,
    );

    if (validatedDto) {
        try {
            const deletedCount = await qcFlagService.deleteAllForDataPass(validatedDto.query.dataPassId);
            res.status(200).json({ data: { deletedCount } });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

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

/**
 * Get QC flags summary for data/simulation pass
 */
const getQcFlagsSummaryHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly(Joi.object({
            dataPassId: Joi.number(),
            simulationPassId: Joi.number(),
            mcReproducibleAsNotBad: Joi.boolean().optional(),
            lhcPeriodId: Joi.number(),
        }).xor('dataPassId', 'simulationPassId', 'lhcPeriodId')),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                dataPassId,
                simulationPassId,
                lhcPeriodId,
                mcReproducibleAsNotBad = false,
            } = validatedDTO.query;

            const data = await qcFlagSummaryService.getSummary({ dataPassId, simulationPassId, lhcPeriodId }, { mcReproducibleAsNotBad });
            res.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

/**
 * Get QC flags in GAQ effective periods for given data pass and run
 */
const getGaqQcFlagsHandler = async (request, response) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly(Joi.object({
            dataPassId: Joi.number(),
            runNumber: Joi.number(),
        })),
        request,
        response,
    );
    if (validatedDTO) {
        try {
            const { dataPassId, runNumber } = validatedDTO.query;

            const data = await gaqService.getFlagsForDataPassAndRun(dataPassId, runNumber);
            response.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

/**
 * Get GAQ summary for given data pass
 */
const getGaqSummaryHandler = async (request, response) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly(Joi.object({
            dataPassId: Joi.number().required(),
            mcReproducibleAsNotBad: Joi.boolean().optional(),
        })),
        request,
        response,
    );
    if (validatedDTO) {
        try {
            const { dataPassId, mcReproducibleAsNotBad = false } = validatedDTO.query;

            const data = await gaqService.getSummary(dataPassId, { mcReproducibleAsNotBad });
            response.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

exports.QcFlagController = {
    getQcFlagByIdHandler,
    listQcFlagsPerDataPassHandler,
    listQcFlagsPerSimulationPassHandler,
    listSynchronousQcFlagsHandler,
    createQcFlagsHandler,
    deleteQcFlagByIdHandler,
    deleteQcFlagsByDataPassHandler,
    verifyQcFlagHandler,
    getQcFlagsSummaryHandler,
    getGaqQcFlagsHandler,
    getGaqSummaryHandler,
};
