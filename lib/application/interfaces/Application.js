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

/**
 * Application
 */
class Application {
    /**
     * Returns wether or not to the application is in test mode.
     *
     * @returns {Boolean} Wether or not to the application is in test mode.
     */
    isInTestMode() {
        throw new Error('The method or operation is not implemented.');
    }

    /**
     * Causes the application to be scheduled for execution.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async run() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Begins the process of terminating the application. Calling this method terminates the process.
     *
     * @param {Boolean} [immediate=false] Indicates if the underlying services should be closed immediately; if *false*
     *                                    it will close the underlying services gracefully.
     * @returns {Promise} Promise object represents the outcome.
     */
    async stop(immediate) {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = Application;
