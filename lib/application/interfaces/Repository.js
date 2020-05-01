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
 * Repository
 */
class Repository {
    /**
     * Returns the total number of entities.
     *
     * @returns {Number} Promise object representing the total number of entities.
     */
    async count() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Returns all entities.
     *
     * @returns {Promise} Promise object represents the ...
     */
    async findAll() {
        return Promise.reject('The method or operation is not implemented.');
    }

    /**
     * Insert entity.
     *
     * @param {Object} entity entity to insert.
     * @returns {Promise} Promise object represents the ...
     */
    async insert(entity) {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = Repository;
