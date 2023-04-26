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

const { dtoValidator } = require('../utilities/index.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { DtoFactory } = require('../../domain/dtos/DtoFactory.js');
const Joi = require('joi');
const { dplProcessService } = require('../services/dpl/DplProcessService.js');

// eslint-disable-next-line valid-jsdoc
/**
 * Route to fetch all the detectors that have at least one executed process for a given run
 */
const getAllDetectorsWithExecutedProcessesByRunHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({ runNumber: Joi.number().required() }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllDetectorsWithExecutedProcessesByRun({ runNumber: requestDto.query.runNumber });
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

exports.DplProcessController = {
    getAllDetectorsWithExecutedProcessesByRunHandler,
};
