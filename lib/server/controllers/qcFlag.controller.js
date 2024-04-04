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
                detectorIds: Joi.array().items(Joi.number()),
                userNames: Joi.array().items(Joi.string()),
            },
            page: PaginationDto,
            sort: DtoFactory.order(['id', 'from', 'to', 'createdBy']),
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

module.exports = {
    listQcFlagsHandler,
};
