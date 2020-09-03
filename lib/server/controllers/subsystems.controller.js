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
    subsystem: {
        CreateSubsystemUseCase,
        DeleteSubsystemUseCase,
        GetAllSubsystemsUseCase,
        GetLogsBySubsystemUseCase,
        GetSubsystemUseCase,
    },
} = require('../../usecases');
const {
    dtos: {
        CreateSubsystemDto,
        GetAllSubsystemsDto,
        GetSubsystemDto,
    },
} = require('../../domain');
const { dtoValidator } = require('../utilities');

/**
 * Get all subsystems.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const index = async (request, response, next) => {
    const value = await dtoValidator(GetAllSubsystemsDto, request, response);
    if (!value) {
        return;
    }

    const { count, subsystems } = await new GetAllSubsystemsUseCase()
        .execute(value);

    const { query: { page: { limit = 100 } = {} } } = value;
    const totalPages = Math.ceil(count / limit);

    response.status(200).json({
        data: subsystems,
        meta: {
            page: {
                pageCount: totalPages,
                totalCount: count,
            },
        },
    });
};

/**
 * Get subsystem.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const read = async (request, response, next) => {
    const value = await dtoValidator(GetSubsystemDto, request, response);
    if (!value) {
        return;
    }

    const subsystem = await new GetSubsystemUseCase()
        .execute(value);

    if (subsystem) {
        response.status(200).json({
            data: subsystem,
        });
    } else {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Subsystem with this id (${value.params.subsystemId}) could not be found`,
                },
            ],
        });
    }
};

/**
 * Create subsystem.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const create = async (request, response, next) => {
    const value = await dtoValidator(CreateSubsystemDto, request, response);
    if (!value) {
        return;
    }

    const subsystem = await new CreateSubsystemUseCase()
        .execute(value);

    if (subsystem) {
        response.status(201).json({
            data: subsystem,
        });
    } else {
        response.status(409).json({
            errors: [
                {
                    status: '409',
                    source: { pointer: '/data/attributes/body/text' },
                    title: 'Conflict',
                    detail: 'The provided entity already exists',
                },
            ],
        });
    }
};

/**
 * Delete subsystem.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const deleteSubsystem = async (request, response, next) => {
    const value = await dtoValidator(GetSubsystemDto, request, response);
    if (!value) {
        return;
    }

    const subsystem = await new DeleteSubsystemUseCase()
        .execute(value);

    if (subsystem) {
        response.status(200).json({
            data: subsystem,
        });
    } else {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Subsystem with this id (${value.params.subsystemId}) could not be found`,
                },
            ],
        });
    }
};

/**
 * Get all logs with subsystem.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getLogsBySubsystemId = async (request, response, next) => {
    const value = await dtoValidator(GetSubsystemDto, request, response);
    if (!value) {
        return;
    }

    const logs = await new GetLogsBySubsystemUseCase()
        .execute(value);

    if (logs === null) {
        response.status(404).json({
            errors: [
                {
                    status: '404',
                    title: `Subsystem with this id (${value.params.subsystemId}) could not be found`,
                },
            ],
        });
    } else {
        response.status(200).json({
            data: logs,
        });
    }
};

module.exports = {
    create,
    deleteSubsystem,
    getLogsBySubsystemId,
    index,
    read,
};
