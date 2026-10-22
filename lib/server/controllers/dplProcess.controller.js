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
const EntityIdDto = require('../../domain/dtos/EntityIdDto.js');
const { dplProcessService } = require('../services/dpl/DplProcessService.js');

/**
 * Route to fetch all the DPL detectors that have at least one executed process for a given run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const getAllDplDetectorsWithExecutedProcessesByRunHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({ runNumber: EntityIdDto.required() }),
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

/**
 * Route to fetch all the processes that have been executed at least once for a given run and detector
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const getAllExecutedProcessesByRunAndDplDetectorHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: EntityIdDto.required(),
            detectorId: EntityIdDto.required(),
        }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllExecutedProcessesByRunAndDetector(
                { runNumber: requestDto.query.runNumber },
                { detectorId: requestDto.query.detectorId },
            );
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

/**
 * Route to fetch all the hosts on which a given process has been executed for a given run and detector
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const getAllHostsWithExecutedProcessByRunAndDplDetectorHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: EntityIdDto.required(),
            detectorId: EntityIdDto.required(),
            processId: EntityIdDto.required(),
        }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllHostWithExecutedProcessByRunAndDetector(
                { runNumber: requestDto.query.runNumber },
                { detectorId: requestDto.query.detectorId },
                { dplProcessId: requestDto.query.processId },
            );
            response.status(200).json({ data });
        } catch (error) {
            updateExpressResponseFromNativeError(response, error);
        }
    }
};

/**
 * Route to fetch all executions of a given process on a given host for a given run and detector
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {Promise<void>} resolves once the response has been sent
 */
const getAllProcessExecutionByRunAndDplDetectorAndHostHandler = async (request, response) => {
    const requestDto = await dtoValidator(
        DtoFactory.queryOnly({
            runNumber: EntityIdDto.required(),
            detectorId: EntityIdDto.required(),
            processId: EntityIdDto.required(),
            hostId: EntityIdDto.required(),
        }),
        request,
        response,
    );
    if (requestDto) {
        try {
            const data = await dplProcessService.getAllProcessExecutionByRunAndDetectorAndHost(
                { runNumber: requestDto.query.runNumber },
                { detectorId: requestDto.query.detectorId },
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
