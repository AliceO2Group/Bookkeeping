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
     * Constructor
     */
    constructor() {
        /**
         * @type {ReasonTypeAdapter|null}
         */
        this.reasonTypeAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given end of run reason database object to an entity object.
     * @param {SequelizeEorReason} databaseObject Object to convert.
     * @returns {EorReason} Converted entity object.
     */
    toEntity({ id, description, runId, reasonTypeId, reasonType, lastEditedName, createdAt, updatedAt }) {
        const entityObject = {
            id,
            description,
            lastEditedName,
            reasonTypeId,
            runId,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };

        if (reasonType) {
            const reasonTypeEntity = this.reasonTypeAdapter.toEntity(reasonType);
            entityObject.category = reasonTypeEntity.category;
            entityObject.title = reasonTypeEntity.title;
        }
        return entityObject;
    }

    /**
     * Converts the given entity object to an end of run reason database object
     *
     * @param {Partial<EorReason>} entityObject Object to convert.
     * @returns {Partial<SequelizeEorReason>} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            id: entityObject.id,
            description: entityObject.description,
            lastEditedName: entityObject.lastEditedName,
            reasonTypeId: entityObject.reasonTypeId,
            runId: entityObject.runId,
        };
    }
}

module.exports = EorReasonAdapter;
