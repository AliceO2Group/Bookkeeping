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
 * Database
 */
class Database {
    /**
     * Returns all available models.
     */
    get models() {
        throw new Error('The method or operation is not implemented.');
    }

    /**
     * Returns all available repositories.
     */
    get repositories() {
        return require('./database/repositories');
    }

    /**
     * Returns all available utilities.
     */
    get utilities() {
        return require('./database/utilities');
    }

    /**
     * Performs connection to the database.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async connect() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Performs disconnect to the database.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async disconnect() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Executes every *pending* migrations.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async migrate() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Executes every *pending* seed.
     *
     * @returns {Promise} Promise object represents the outcome.
     */
    async seed() {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = Database;
