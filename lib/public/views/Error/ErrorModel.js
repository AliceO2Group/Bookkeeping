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

import { Observable } from '/js/src/index.js';

/**
 * Model representing handlers for errorPage.js
 */
export class ErrorModel extends Observable {
    /**
     * The Error object.
     * @typedef {(Object)} Error
     * @property {string} code - The error code
     * @property {string} codeDescription - The description of the error code
     * @property {string} message - The error message
     */

    /**
     * The constructor for the Error model object
     * @returns {Object} Constructs the Error model
     */
    constructor() {
        super();
        this.error = {
            code: 'Unknown Error',
            codeDescription: 'Something unexpected happened.',
            message: 'Please try again later.',
        };
    }

    /**
     * Sets the error object for the model
     * @param {Error} error The error object
     * @returns {void}
     */
    setError(error) {
        if (!error.code || !error.codeDescription || !error.message) {
            return;
        }
        this.error = error;
        this.notify();
    }

    /**
     * Returns the error object for the model
     * @returns {Error} The error object
     */
    getError() {
        return this.error;
    }
}
