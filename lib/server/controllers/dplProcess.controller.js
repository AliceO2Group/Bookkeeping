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
 * Route to fetch all the dpl detectors that have at least one executed process for a given run
 */
const getAllDplDetectorsWithExecutedProcessesByRunHandler = async (request, response) => {
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

// eslint-disable-next-line valid-jsdoc
/**
 * Route to fetch all the processes that have been executed at least once for a given run and detector
 */
const getAllExecutedProcessesByRunAndDplDetectorHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: Joi.number().required(),
            detectorId: Joi.number().required(),
        }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runNumber: requestDto.query.runNumber },
                { dplDetectorId: requestDto.query.detectorId },
            );
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Route to fetch all the hosts that on which a given process has been executed for a given run and detector
 */
const getAllHostsWithExecutedProcessByRunAndDplDetectorHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: Joi.number().required(),
            detectorId: Joi.number().required(),
            processId: Joi.number().required(),
        }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: requestDto.query.runNumber },
                { dplDetectorId: requestDto.query.detectorId },
                { dplProcessId: requestDto.query.processId },
            );
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Route to fetch all executions of a given process on a given host for a given run and detector
 */
const getAllProcessExecutionByRunAndDplDetectorAndHostHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: Joi.number().required(),
            detectorId: Joi.number().required(),
            processId: Joi.number().required(),
            hostId: Joi.number().required(),
        }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: requestDto.query.runNumber },
                { dplDetectorId: requestDto.query.detectorId },
                { dplProcessId: requestDto.query.processId },
                { hostId: requestDto.query.hostId },
            );
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

exports.DplProcessController = {
    getAllDplDetectorsWithExecutedProcessesByRunHandler,
    getAllExecutedProcessesByRunAndDplDetectorHandler,
    getAllHostsWithExecutedProcessByRunAndDplDetectorHandler,
    getAllProcessExecutionByRunAndDplDetectorAndHostHandler,
};
