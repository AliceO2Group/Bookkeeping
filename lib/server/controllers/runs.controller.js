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

const {
    run: {
        EndRunUseCase,
        GetAllReasonTypesUseCase,
        GetAllRunsUseCase,
        GetFlpsByRunUseCase,
        GetLogsByRunUseCase,
        GetRunUseCase,
        GetMultipleRunsUseCase,
        StartRunUseCase,
        UpdateRunUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        EndRunDto,
        GetAllRunsDto,
        GetRunDto,
        GetMultipleRunsDto,
        UpdateRunByRunNumberDto,
        StartRunDto,
        UpdateRunDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');
const { ApiConfig } = require('../../config/index.js');
const { DtoFactory } = require('../../domain/dtos/DtoFactory.js');
const { runService } = require('../services/run/RunService.js');
const { updateExpressResponseFromNativeError } = require('../express/updateExpressResponseFromNativeError.js');
const { runToHttpView } = require('./runsToHttpView.js');

/**
 * Set express response status and body to inform the client that no run was found with the given identifier.
 * @param {object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {RunIdentifier} runIdentifier run identifier which references non-existing run
 * @return {void}
 */
const noRunWithIdentifierResponse = (response, runIdentifier) => {
    const { runId, runNumber } = runIdentifier;
    response.status(404).json({
        errors: [
            {
                status: '404',
                title: `Run with this ${runNumber ? `run number (${runNumber})` : `id (${runId})`} could not be found`,
            },
        ],
    });
};

/**
 * Get all runs.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const listRuns = async (request, response) => {
    const value = await dtoValidator(GetAllRunsDto, request, response);
    if (!value) {
        return;
    }
    const { count, runs } = await new GetAllRunsUseCase().execute(value);

    const { query: { page: { limit = ApiConfig.pagination.limit } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: runs.map(runToHttpView),
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Get run.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getRunByIdentifierHandler = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const run = await new GetRunUseCase()
        .execute(value);

    if (run === null) {
        noRunWithIdentifierResponse(response, value.params);
    } else {
        response.status(200).json({
            data: runToHttpView(run),
        });
    }
};

/**
 * /**
 * Get runs by list of ids.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param { runNumbers } runNumbers The list of query param run numbers
 * @returns {undefined}
 */
const getRunsByListIds = async (request, response) => {
    const runNumbersString = request.params.runNumbers;
    const runNumbersArray = runNumbersString.split(',').map((num) => parseInt(num, 10));

    const params = { runNumbers: runNumbersArray };

    const value = await dtoValidator(GetMultipleRunsDto, { ...request, params }, response);
    if (!value) {
        return;
    }

    const runs = await new GetMultipleRunsUseCase().execute(value);

    if (!runs) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Runs with these ids (${runNumbersString}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: runs.map(runToHttpView),
        });
    }
};

/**
 * Get all logs with run.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogsByRunNumberHandler = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const logs = await new GetLogsByRunUseCase()
        .execute(value);

    if (logs === null) {
        noRunWithIdentifierResponse(response, value.params);
    } else {
        response.status(200).json({
            data: logs,
        });
    }
};

/**
 * Get all logs with run.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getFlpsByRunNumberHandler = async (request, response, next) => {
    const value = await dtoValidator(GetRunDto, request, response);
    if (!value) {
        return;
    }

    const flps = await new GetFlpsByRunUseCase().execute(value);

    if (flps === null) {
        noRunWithIdentifierResponse(response, value.params);
    } else {
        response.status(200).json({
            data: flps,
        });
    }
};

/**
 * Create a new Run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const startRun = async (request, response) => {
    const value = await dtoValidator(StartRunDto, request, response);
    if (!value) {
        return;
    }

    const { result: run, error } = await new StartRunUseCase()
        .execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: runToHttpView(run) });
    }
};

/**
 * Edit end time of a run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const endRun = async (request, response) => {
    const value = await dtoValidator(EndRunDto, request, response);
    if (!value) {
        return;
    }

    const { result: run, error } = await new EndRunUseCase().execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: runToHttpView(run) });
    }
};

/**
 * Update the fields of a run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const updateRun = async (request, response) => {
    const value = await dtoValidator(UpdateRunDto, request, response);
    if (!value) {
        return;
    }

    const { result: run, error } = await new UpdateRunUseCase().execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(201).json({ data: runToHttpView(run) });
    }
};

/**
 * Update the fields of a run
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @returns {undefined}
 */
const updateRunByRunNumber = async (request, response) => {
    const value = await dtoValidator(UpdateRunByRunNumberDto, request, response);
    if (!value) {
        return;
    }

    const { result: run, error } = await new UpdateRunUseCase().execute(value);

    if (error) {
        response.status(Number(error.status)).json({ errors: [error] });
    } else {
        response.status(200).json({ data: runToHttpView(run) });
    }
};

/**
 * Retrieve a list of reason types objects
 *
 * @param {Object} _request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets
 *     an
 *                          HTTP request.
 * @param {Function} _next The *next* object represents the next middleware function which is used to pass control to
 *     the next middleware function.
 * @returns {undefined}
 */
const listReasonTypes = async (_request, response, _next) => {
    try {
        const reasonTypes = await new GetAllReasonTypesUseCase().execute();
        if (reasonTypes && reasonTypes.length > 0) {
            response.status(200).json({ data: reasonTypes });
        } else {
            response.status(204).json({ data: [] });
        }
    } catch (error) {
        response.status(502).json({ errors: ['Unable to retrieve list of reason types'] });
    }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Retrieve distinct combination of levels of alice L3 and dipole current rounded to kilo amperes
 */
const listAllAliceL3AndDipoleLevelsForPhysicsRuns = async (req, res) => {
    const validatedDTO = await dtoValidator(
        DtoFactory.queryOnly(),
        req,
        res,
    );
    if (validatedDTO) {
        try {
            const rows = await runService.getAllAliceL3AndDipoleLevelsForPhysicsRuns();
            res.json({ data: rows });
        } catch (error) {
            updateExpressResponseFromNativeError(res, error);
        }
    }
};

module.exports = {
    endRun,
    getRunByIdentifierHandler,
    getRunsByListIds,
    getLogsByRunNumberHandler,
    getFlpsByRunNumberHandler,
    listReasonTypes,
    listRuns,
    startRun,
    updateRunByRunNumber,
    updateRun,
    listAllAliceL3AndDipoleLevelsForPhysicsRuns,
};
