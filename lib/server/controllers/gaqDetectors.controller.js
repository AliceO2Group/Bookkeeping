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
const { dataPassService } = require('../services/dataPasses/DataPassService.js');
const { dtoValidator } = require('../utilities/dtoValidator.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');

// eslint-disable-next-line valid-jsdoc
/**
 *
 */
const setGaqDetectors = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.bodyOnly(Joi.object({
            dataPassId: Joi.number(),
            runNumbers: Joi.array().items(Joi.number()).unique(),
            dplDetectorIds: Joi.array().items(Joi.number()).unique(),
        })),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const {
                dataPassId,
                runNumbers,
                dplDetectorIds,
            } = validatedDTO.body;

            const data = await dataPassService.setGaqDetectors(
                dataPassId,
                runNumbers,
                dplDetectorIds,
            );

            res.status(201).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * List DPL detectors contributing to GAQ for given data pass and run
 */
const listGaqDetectors = async (req, res) => {
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
            const {
                dataPassId,
                runNumber,
            } = validatedDTO.query;

            const data = await dataPassService.getGaqDetectors(dataPassId, runNumber);
            res.json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

exports.GaqDetectorController = {
    setGaqDetectors,
    listGaqDetectors,
};