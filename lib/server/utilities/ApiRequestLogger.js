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
 * Maximum length of the stringified params in the log entry, to keep the entries small
 */
const MAX_PARAMS_LENGTH = 500;

/**
 * Logs one single-line JSON entry for each API request, whatever the protocol (HTTP or gRPC), so that they share the same structure
 *
 * Entries are sent to the local logger only (no log level is provided, so they are NOT forwarded to InfoLogger)
 */
class ApiRequestLogger {
    /**
     * Constructor
     *
     * @param {object} [configuration] the logger configuration
     * @param {{infoMessage: function(string): void}} [configuration.logger] the logger to use
     * @param {boolean} [configuration.silent] if true, nothing is logged (defaults to true in test mode)
     */
    constructor({ logger = LogManager.getLogger('API'), silent = isInTestMode() } = {}) {
        this._logger = logger;
        this._silent = silent;
    }

    /**
     * States if the logger is silent
     *
     * @return {boolean} true if nothing will be logged
     */
    get silent() {
        return this._silent;
    }

    /**
     * Starts a timer
     *
     * @return {function(): number} function returning the number of milliseconds elapsed since the timer was started
     */
    startTimer() {
        const startTime = process.hrtime.bigint();
        return () => Number((process.hrtime.bigint() - startTime) / NANOSECONDS_PER_MILLISECOND);
    }

    /**
     * Logs an API request. This function never throws: logging must not impact the request
     *
     * @param {object} request the request to log
     * @param {ApiProtocols} request.protocol the protocol of the request
     * @param {string|null} [request.method] the HTTP method (not applicable to gRPC)
     * @param {string} request.route the HTTP route pattern or the gRPC method path
     * @param {number} request.status the HTTP status or gRPC status code
     * @param {number} request.durationMs the duration of the request
     * @param {number|null} [request.userId] the id of the user
     * @param {number|null} [request.bytes] the size of the response
     * @param {object|string|null} [request.params] the HTTP query or gRPC request message (or its already stringified snapshot), logged as a
     *     (truncated) JSON string, omitted if empty
     * @param {boolean} [request.aborted] true if the request has been interrupted before the end of the response
     * @return {void}
     */
    log({ protocol, method = null, route, status, durationMs, userId = null, bytes = null, params, aborted }) {
        if (this._silent) {
            return;
        }

        try {
            const entry = { type: 'api_request', protocol, method, route, status, durationMs, userId, bytes };

            const stringifiedParams = ApiRequestLogger.stringifyParams(params);
            if (stringifiedParams !== null) {
                entry.params = stringifiedParams;
            }
            if (aborted) {
                entry.aborted = true;
            }

            this._logger.infoMessage(JSON.stringify(entry));
        } catch {
            // Ignored: a failure to log must never impact the request
        }
    }

    /**
     * Stringifies the params to a size limited JSON string
     *
     * @param {object|string|null} [params] the params to stringify. A string is considered as already stringified and is returned as is
     * @return {string|null} the stringified params, null if there is nothing to log or if they can not be stringified
     */
    static stringifyParams(params) {
        if (typeof params === 'string') {
            return params;
        }

        if (!params || Object.keys(params).length === 0) {
            return null;
        }

        let stringified;
        try {
            // Bigints can not be natively stringified
            stringified = JSON.stringify(params, (_key, value) => typeof value === 'bigint' ? value.toString() : value);
        } catch {
            return null;
        }

        return stringified.length > MAX_PARAMS_LENGTH ? `${stringified.slice(0, MAX_PARAMS_LENGTH)}…` : stringified;
    }
}

exports.ApiRequestLogger = ApiRequestLogger;

exports.MAX_PARAMS_LENGTH = MAX_PARAMS_LENGTH;
