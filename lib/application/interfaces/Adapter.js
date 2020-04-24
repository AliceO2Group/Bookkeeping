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
 * Adapter
 */
class Adapter {
    /**
     * Converts a persistence object to a domain object.
     *
     * @param {Object} persistenceObject the persistence object to convert.
     * @return {Object} The resulted domain object.
     */
    static toDomain(persistenceObject) {
        throw new Error('The method or operation is not implemented.');
    }

    /**
     * Converts a domain object to a persistence object.
     *
     * @param {Object} domainObject the domain object to convert.
     * @return {Object} The resulted persistence object.
     */
    static toPersistence(domainObject) {
        throw new Error('The method or operation is not implemented.');
    }
}

module.exports = Adapter;
