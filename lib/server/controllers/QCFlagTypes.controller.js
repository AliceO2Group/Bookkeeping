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
const { qcFlagTypesService } = require('../services/qualityControlFlag/QcFlagTypeService');

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
            const qcFlagType = await qcFlagTypesService.getOneOrFail(validatedDTO.params.id);
            res.json({ data: qcFlagType });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.QcFlagTypesController = {
    getQcFlagTypeByIdHandler,
};
