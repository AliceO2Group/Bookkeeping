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

/**
 * Logger dedicated to filter-related endpoint access events.
 */
class FilterLogger {
    /**
     * Creates an instance of FilterLogger.
     */
    constructor() {
        LogManager.configure({ infologger: true });
        this._logger = LogManager.getLogger('FILTERING');
        this._logLevel = LogLevel.OPERATIONS;
    }

    /**
     * Logs an informational message about endpoint access and applied filters.
     *
     * @param {string} endpoint the endpoint that was accessed.
     * @param {string|number} userId identifier of the user accessing the endpoint.
     * @param {Object} [filters={}] filters applied to the request.
     * @returns {void}
     */
    infoMessage(endpoint, userId, filters = {}) {
        let message = `Endpoint ${endpoint} was accessed by user ${userId} `;

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
