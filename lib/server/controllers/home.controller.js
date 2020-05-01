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

const { server: { GetDeployInformationUseCase, GetServerInformationUseCase } } = require('../../application/usecases');

/**
 * Basic api information controller.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getServerInfo = async (request, response, next) => {
    let serverInfo;
    try {
        serverInfo = await new GetServerInformationUseCase().execute();
    } catch (error) {
        next(error);
        return;
    }

    response.status(200).json(serverInfo);
};

/**
 * Basic deploy information controller.
 *
 * @param {Object} request The *request* object represents the HTTP request and has properties for the request query
 *                         string, parameters, body, HTTP headers, and so on.
 * @param {Object} response The *response* object represents the HTTP response that an Express app sends when it gets an
 *                          HTTP request.
 * @param {Function} next The *next* object represents the next middleware function which is used to pass control to the
 *                        next middleware function.
 * @returns {undefined}
 */
const getDeployInfo = async (request, response, next) => {
    let deployInfo;
    try {
        deployInfo = await new GetDeployInformationUseCase().execute();
    } catch (error) {
        next(error);
        return;
    }

    response.status(200).json(deployInfo);
};

module.exports = {
    getDeployInfo,
    getServerInfo,
};
