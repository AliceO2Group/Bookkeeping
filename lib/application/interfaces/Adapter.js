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
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        throw new Error('The method or operation is not implemented.');
    }

    /**
     * Converts the given entity object to an database object.
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        throw new Error('The method or operation is not implemented.');
    }
}

module.exports = Adapter;
