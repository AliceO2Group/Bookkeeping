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
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { PaginationDto } = require('../../domain/dtos');
const { ApiConfig } = require('../../config');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView');
const { qcFlagService } = require('../services/qualityControlFlag/QcFlagService.js');
const { BkpRoles } = require('../../domain/enums/BkpRoles.js');

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
 * List All QcFlags
 */
const listQcFlagsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                ids: Joi.array().items(Joi.number()),
                dataPassIds: Joi.array().items(Joi.number()),
                simulationPassIds: Joi.array().items(Joi.number()),
                runNumbers: Joi.array().items(Joi.number()),
                dplDetectorIds: Joi.array().items(Joi.number()),
                createdBy: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'from', 'to', 'createdBy', 'flagType', 'createdAt', 'updatedAt']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                filter,
                page: { limit = ApiConfig.pagination.limit, offset } = {},
                sort = { updatedAt: 'DESC' },
            } = validatedDTO.query;

            const { count, rows: items } = await qcFlagService.getAll({
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
            const parameters = { from, to, comment };
            const relations = {
                user: { externalUserId: validatedDTO.session.externalId },
                flagTypeId,
                runNumber,
                dplDetectorId,
                dataPassId,
                simulationPassId,
            };
            let createdFlag;
            if (dataPassId) {
                createdFlag = await qcFlagService.createForDataPass(parameters, relations);
            } else {
                createdFlag = await qcFlagService.createForSimulationPass(parameters, relations);
            }
            res.status(201).json({ data: createdFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Get one QC Flag by its id
 */
const deleteQcFlagByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({ id: Joi.number() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const user = {
                externalUserId: validatedDTO.session.externalId,
                isAdmin: validatedDTO.session.access.includes(BkpRoles.ADMIN),
            };

            const qcFlag = await qcFlagService.delete(validatedDTO.params.id, { user });
            res.json({ data: qcFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.QcFlagController = {
    getQcFlagByIdHandler,
    listQcFlagsHandler,
    createQcFlagHandler,
    deleteQcFlagByIdHandler,
};
