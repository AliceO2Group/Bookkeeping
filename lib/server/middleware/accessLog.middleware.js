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

const { ApiRequestLogger } = require('../utilities/ApiRequestLogger.js');
const { ApiProtocols } = require('../../domain/enums/ApiProtocols.js');

/**
 * Express middleware logging one single-line JSON entry for each handled API request, once its response has been sent.
 *
 * The entry is built by {@see ApiRequestLogger}, so it has the same structure as the gRPC ones. It contains the method, the route pattern (not
 * the raw url, to keep it aggregable), the status, the duration, the id of the user, the size of the response and the query (as params)
 *
 * @param {object} [configuration] the middleware configuration, see {@see ApiRequestLogger}
 * @return {function(object, object, function): void} the access log middleware
 */
exports.accessLogMiddleware = (configuration) => {
    const apiRequestLogger = new ApiRequestLogger(configuration);

    return (request, response, next) => {
        if (apiRequestLogger.silent) {
            next();
            return;
        }

        const stopTimer = apiRequestLogger.startTimer();
        // The base url (i.e. the router mount path) must be read now, as express restores it when leaving the router
        const { baseUrl } = request;
        // Needed as to not duplicate logging in case of both close and finish events triggering the log function
        let logged = false;

        const log = () => {
            if (logged) {
                return;
            }
            logged = true;

            const { method, query, session, route, originalUrl } = request;
            const contentLength = Number(response.getHeader('content-length'));

            // The token is a credential and must never be logged
            const params = { ...query };
            delete params.token;

            apiRequestLogger.log({
                protocol: ApiProtocols.HTTP,
                method,
                route: route ? `${baseUrl}${route.path}` : originalUrl.split('?')[0],
                status: response.statusCode,
                durationMs: stopTimer(),
                userId: session?.id ?? null,
                bytes: Number.isNaN(contentLength) ? null : contentLength,
                params,
                aborted: !response.writableFinished,
            });
        };

        response.once('finish', log);
        response.once('close', log);
        next();
    };
};
