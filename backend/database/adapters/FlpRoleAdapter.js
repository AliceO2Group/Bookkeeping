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
 * FlpRoleAdapter
 */
class FlpRoleAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {RunAdapter|null}
         */
        this.runAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeFlpRole} databaseObject Object to convert.
     * @returns {FlpRole} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            runNumber,
            name,
            hostname,
            nTimeframes,
            rootFlpId,
            bytesProcessed,
            bytesEquipmentReadOut,
            bytesRecordingReadOut,
            bytesFairMQReadOut,
            run,
        } = databaseObject;

        return {
            id,
            runNumber,
            name,
            hostname,
            nTimeframes,
            rootFlpId: rootFlpId || id,
            bytesProcessed,
            bytesEquipmentReadOut,
            bytesRecordingReadOut,
            bytesFairMQReadOut,
            run: run ? this.runAdapter.toMinifiedEntity(run) : null,
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<FlpRole>} entityObject Object to convert.
     * @returns {Partial<SequelizeFlpRole>} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            id: entityObject.id,
            runNumber: entityObject.runNumber,
            name: entityObject.name,
            hostname: entityObject.hostname,
            nTimeframes: entityObject.nTimeframes,
            bytesProcessed: entityObject.bytesProcessed,
            bytesEquipmentReadOut: entityObject.bytesEquipmentReadOut,
            bytesRecordingReadOut: entityObject.bytesRecordingReadOut,
            bytesFairMQReadOut: entityObject.bytesFairMQReadOut,
            subtype: 'run',
        };
    }
}

module.exports = FlpRoleAdapter;
