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
const { qcFlagTypesService } = require('../services/qualityControlFlag/QCFlagTypesService');
const { ApiConfig } = require('../../config');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView');
const PaginationDto = require('../../domain/dtos/PaginationDto');

// eslint-disable-next-line valid-jsdoc
/**
 * Get one Simulation Pass by id
 */
const getQCFlagTypeByIdHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.paramsOnly({ id: Joi.number() }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const qcFlagType = await qcFlagTypesService.getOneOrFail({ id: validatedDTO.params.id });
            res.json({ data: qcFlagType });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Create QualityControlFlag
 */
const createQCFlagTypeHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly({
            timeStart: Joi.number().required(),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const createFlag = await qcFlagTypesService.create(validatedDTO.body);
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
const listQCFlagTypesHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                ids: Joi.array().items(Joi.number()),
                bad: Joi.boolean(),
                archived: Joi.boolean(),
                names: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.object({ like: Joi.array().items(Joi.string()) })),
                methods: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.object({ like: Joi.array().items(Joi.string()) })),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'name', 'bad', 'method', 'createdAt', 'updatedAt']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { filter, page: { limit = ApiConfig.pagination.limit, offset } = {}, sort = { name: 'DESC' } } = validatedDTO.query;
            const { count, rows: items } = await qcFlagTypesService.getAll({
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

exports.QCFlagTypesController = {
    getQCFlagTypeByIdHandler,
    listQCFlagTypesHandler,
};
