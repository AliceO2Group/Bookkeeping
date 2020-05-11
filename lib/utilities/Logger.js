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

const { Log } = require('@aliceo2/web-ui');

module.exports = (name) => {
    /**
     * WebUI implementation of the Logger.
     */
    class WebUiLogger {
        /**
         * Creates a new `WebUi Logger` instance.
         */
        constructor() {
            this.logger = new Log(name);
        }

        /**
         * Log a message with debug log level.
         *
         * @param {Object} message log this message
         * @returns {undefined}
         */
        debug(message) {
            this.logger.debug(message);
        }

        /**
         * Log a message with error log level.
         *
         * @param {Object} message log this message
         * @returns {undefined}
         */
        error(message) {
            this.logger.error(message);
        }

        /**
         * Log a message with info log level.
         *
         * @param {Object} message log this message
         * @returns {undefined}
         */
        info(message) {
            this.logger.info(message);
        }

        /**
         * Log a message with trace log level.
         *
         * @param {Object} message log this message
         * @returns {undefined}
         */
        trace(message) {
            this.logger.trace(message);
        }

        /**
         * Log a message with warn log level.
         *
         * @param {Object} message log this message
         * @returns {undefined}
         */
        warn(message) {
            this.logger.warn(message);
        }
    }

    return new WebUiLogger(name);
};
