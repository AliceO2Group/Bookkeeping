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
 * Eor(End of Run) Adapter
 */
class EorReasonAdapter {
    /**
     * Converts the given end of run reason database object to an entity object.
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            id,
            category,
            title,
            lastEditedName,
            createdAt,
            updatedAt,
        } = databaseObject;

        const entityObject = {
            id,
            category,
            title,
            lastEditedName,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };
        return entityObject;
    }

    /**
     * Converts the given entity object to an end of run reason database object
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        const databaseObject = {
            id: entityObject.id,
            category: entityObject.category,
            title: entityObject.title,
            lastEditedName: entityObject.lastEditedName,
            createdAt: entityObject.createdAt,
            updatedAt: entityObject.createdAt,
        };
        return databaseObject;
    }
}

module.exports = EorReasonAdapter;
