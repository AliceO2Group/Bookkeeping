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

const { LogManager } = require('@aliceo2/web-ui');
const { isInTestMode } = require('../../utilities/env-utils');

const NANOSECONDS_PER_MILLISECOND = 1000000n;

/**
 * Express middleware logging one single-line JSON entry for each handled API request, once its response has been sent.
 *
 * The entry is sent to the local logger only (no log level is provided, so it is NOT forwarded to InfoLogger). It contains the method, the route
 * pattern (not the raw url, to keep it aggregable), the status, the duration, the id of the user, the size of the response and the query
 *
 * @param {object} [configuration] the middleware configuration
 * @param {{infoMessage: function(string): void}} [configuration.logger] the logger to use
 * @param {boolean} [configuration.silent] if true, nothing is logged (defaults to true in test mode)
 * @return {function(object, object, function): void} the access log middleware
 */
exports.accessLogMiddleware = ({ logger = LogManager.getLogger('API'), silent = isInTestMode() } = {}) => (request, response, next) => {
    if (silent) {
        next();
        return;
    }

    const startTime = process.hrtime.bigint();
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

        const entry = {
            type: 'api_request',
            method,
            route: route ? `${baseUrl}${route.path}` : originalUrl.split('?')[0],
            status: response.statusCode,
            durationMs: Number((process.hrtime.bigint() - startTime) / NANOSECONDS_PER_MILLISECOND),
            userId: session?.id ?? null,
            bytes: Number.isNaN(contentLength) ? null : contentLength,
        };

        if (!response.writableFinished) {
            entry.aborted = true;
        }
        if (query && Object.keys(query).length > 0) {
            entry.query = query;
        }

        logger.infoMessage(JSON.stringify(entry));
    };

    response.once('finish', log);
    response.once('close', log);
    next();
};
