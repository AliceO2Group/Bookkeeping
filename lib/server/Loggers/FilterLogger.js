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
const { LogManager, LogLevel } = require('@aliceo2/web-ui');
const { isInTestMode } = require('../../utilities/env-utils');

/**
 * Logger dedicated to filter-related endpoint access events.
 */
class FilterLogger {
    /**
     * Creates an instance of FilterLogger.
     *
     * @param {boolean} [silent] if true, no message will be logged (defaults to true in test mode)
     */
    constructor(silent = isInTestMode()) {
        LogManager.configure({ infologger: true });
        this._logger = LogManager.getLogger('FILTERING');
        this._logLevel = LogLevel.OPERATIONS;
        this._silent = silent;
    }

    /**
     * Logs an informational message about endpoint access and applied filters.
     *
     * @param {object} request the request received at any given endpoint.
     * @param {string} request.path the endpoint that was accessed.
     * @param {object} [request.session={}] the session of the user accessing the endpoint.
     * @param {string|number} request.session.id identifier of the user accessing the endpoint.
     * @param {object} [request.query={}] the request query, with the applied filters under `filter`.
     * @returns {void}
     */
    infoMessage({ path, session: { id } = {}, query = {} }) {
        if (this._silent) {
            return;
        }

        const filters = query.filter ?? {};

        let message = `Endpoint ${path} was accessed by `;
        message += id ? `user ${id} ` : 'an unauthenticated user ';

        if (!Object.keys(filters).length) {
            message += 'without filters';
        } else {
            message += 'with the following filters:\n';
            message += JSON.stringify(filters);
        }

        this._logger.infoMessage(message, { level: this._logLevel });
    }
}

module.exports = new FilterLogger();
