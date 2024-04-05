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
const { qcFlagTypeService } = require('../services/qualityControlFlag/QcFlagTypeService');
const { PaginationDto } = require('../../domain/dtos');
const { ApiConfig } = require('../../config');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView');

// eslint-disable-next-line valid-jsdoc
/**
 * Get one QC Flag Type by its id
 */
const getQcFlagTypeByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({ id: Joi.number() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const qcFlagType = await qcFlagTypeService.getOneOrFail(validatedDTO.params.id);
            res.json({ data: qcFlagType });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Create QC Flag Type
 */
const createQCFlagTypeHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly({
            name: Joi.string().required(),
            method: Joi.string().required(),
            color: Joi.string().regex(/#[0-9a-fA-F]{6}/).optional().allow(null),
            bad: Joi.boolean().required(),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const createFlag = await qcFlagTypeService.create(validatedDTO.body, { user: { externalUserId: validatedDTO.session.externalId } });
            res.status(201).json({ data: createFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List All QCFlagReasons
 */
const listQcFlagTypesHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                ids: Joi.array().items(Joi.number()),
                bad: Joi.boolean(),
                archived: Joi.boolean(),
                names: Joi.array().items(Joi.string()),
                methods: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'name', 'bad', 'method', 'archived', 'createdAt', 'updatedAt']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                filter,
                page: { limit = ApiConfig.pagination.limit, offset } = {},
                sort = { archived: 'DESC', name: 'DESC' },
            } = validatedDTO.query;

            const { count, rows: items } = await qcFlagTypeService.getAll({
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
 * Update QC Flag Type
 */
const updateQcFlagTypeHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly({
            name: Joi.string().optional(),
            method: Joi.string().optional(),
            color: Joi.string().regex(/#[0-9a-fA-F]{6}/).optional().allow(null),
            bad: Joi.boolean().optional(),
            archived: Joi.boolean().optional().allow(null),
        }).concat(Joi.object({ params: Joi.object({ id: Joi.number().required() }) })),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const updatedFlag = await qcFlagTypeService.update(
                validatedDTO.params.id,
                { ...validatedDTO.body },
                { user: { externalUserId: validatedDTO.session.externalId } },
            );
            res.status(201).json({ data: updatedFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.QcFlagTypesController = {
    getQcFlagTypeByIdHandler,
    listQcFlagTypesHandler,
    createQCFlagTypeHandler,
    updateQcFlagTypeHandler,
};
