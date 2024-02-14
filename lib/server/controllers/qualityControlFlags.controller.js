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
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { countedItemsToHttpView } = require('../utilities/countedItemsToHttpView.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError');
const { qualityControlFlagService } = require('../services/qualityControlFlag/QualityControlFlagService.js');
const PaginationDto = require('../../domain/dtos/PaginationDto.js');
const { getAllQualityControlFlagFlagReasons } = require('../services/qualityControlFlag/getAllFlagReasons.js');

// eslint-disable-next-line valid-jsdoc
/**
 * List All QualityControlFlags
 */
const listQualityControlFlagsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({
            filter: {
                ids: Joi.array().items(Joi.number()),
                dataPassIds: Joi.array().items(Joi.number()),
                runNumbers: Joi.array().items(Joi.number()),
                detectorIds: Joi.array().items(Joi.number()),
                externalUserIds: Joi.array().items(Joi.number()),
                userNames: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'provenance', 'timeStart', 'timeEnd']),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { filter, page: { limit = ApiConfig.pagination.limit, offset } = {}, sort = { id: 'ASC' } } = validatedDTO.query;
            const { count, rows: items } = await qualityControlFlagService.getAll({
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
 * Create QualityControlFlags
 */
const createQualityControlFlagHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly({
            timeStart: Joi.number().required(),
            timeEnd: Joi.number().required(),
            comment: Joi.string().optional(),
            provenance: Joi.string().required(),
            externalUserId: Joi.number().required(),
            flagReasonId: Joi.number().required(),
            runNumber: Joi.number().required(),
            dataPassId: Joi.number().required(),
            detectorId: Joi.number().required(),
        }),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const createFlag = await qualityControlFlagService.create(validatedDTO.body);
            res.status(201).json({ data: createFlag });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List All QualityControlFlagReasons
 */
const listQualityControlFlagReasonsHandler = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly({}),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const flagReasons = await getAllQualityControlFlagFlagReasons();
            res.json({ data: flagReasons });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.QualityControlFlagsController = {
    listQualityControlFlagsHandler,
    createQualityControlFlagHandler,
    listQualityControlFlagReasonsHandler,
};
