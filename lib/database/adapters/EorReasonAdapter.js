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

const ReasonTypeAdapter = require('./ReasonTypeAdapter');

/**
 * Eor(End of Run) Adapter
 */
class EorReasonAdapter {
    /**
     * Converts the given end of run reason database object to an entity object.
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity({ id, description, reasonTypeId, reasonType, lastEditedName, createdAt, updatedAt }) {
        const entityObject = {
            id,
            description,
            reasonTypeId,
            lastEditedName,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };

        if (reasonType) {
            const reasonType = ReasonTypeAdapter.toEntity(reasonType);
            entityObject.category = reasonType.category;
            entityObject.title = reasonType.title;
        }
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
            description: entityObject.description,
            reasonTypeId: entityObject.reasonTypeId,
            runId: entityObject.runId,
            lastEditedName: entityObject.lastEditedName,
            createdAt: entityObject.createdAt,
            updatedAt: entityObject.createdAt,
        };
        return databaseObject;
    }
}

module.exports = EorReasonAdapter;
