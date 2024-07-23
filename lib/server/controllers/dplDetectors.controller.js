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
const { DtoFactory } = require('../../domain/dtos/DtoFactory.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { dplDetectorsService } = require('../services/dpl/DplDetectorsService.js');
const { dtoValidator } = require('../utilities/dtoValidator.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Endpoint handler to list all dpl detectors
 * @return {Promise<void>} promise
 */
exports.listAllDplDetectorsHandler = async (_request, response) => {
    try {
        const detectors = await dplDetectorsService.getAll();
        response.status(200).json({ data: detectors });
    } catch (error) {
        updateExpressResponseFromNativeError(response, error);
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List DPL detectors contributing to GAQ for given data pass and run
 */
exports.listGaqDetectors = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly(Joi.object({
            dataPassId: Joi.number().required(),
            runNumber: Joi.number().required(),
        })),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const { dataPassId, runNumber } = validatedDTO.query;

            const data = await dplDetectorsService.getGaqDetectors(dataPassId, runNumber);
            res.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};
