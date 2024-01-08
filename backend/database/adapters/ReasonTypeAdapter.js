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
 * ReasonType Adapter (Adapter used for selecting a reason for which a run was ended)
 */
class ReasonTypeAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given reason type database object to an entity object.
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    toEntity(databaseObject) {
        const entityObject = {
            id: databaseObject.id,
            category: databaseObject.category,
            title: databaseObject.title,
        };
        return entityObject;
    }

    /**
     * Converts the given entity object to a reason type database object
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    toDatabase(entityObject) {
        const databaseObject = {
            id: entityObject.id,
            category: entityObject.category,
            title: entityObject.title,
            createdAt: entityObject.createdAt,
            updatedAt: entityObject.createdAt,
        };
        return databaseObject;
    }
}

module.exports = ReasonTypeAdapter;
