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
 * List All QCFlagReasons
 */
const listQCFlagTypesHandler = async (req, res) => {
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
                sort = { name: 'DESC', archived: 'DESC' },
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

exports.QcFlagTypesController = {
    getQcFlagTypeByIdHandler,
    listQCFlagTypesHandler,
};
