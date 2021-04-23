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
 * RunAdapter
 */
class FlpAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            id,
            name,
            hostname,
            nTimeframes,
            rootFlpId,
            bytesProcessed,
            bytesEquipmentReadOut,
            bytesRecordingReadOut,
            bytesFairMQReadOut,
            runs,
        } = databaseObject;

        const entityObject = {
            id: id,
            name: name,
            hostname: hostname,
            nTimeframes: nTimeframes,
            rootFlpId: rootFlpId || id,
            bytesProcessed: bytesProcessed,
            bytesEquipmentReadOut: bytesEquipmentReadOut,
            bytesRecordingReadOut: bytesRecordingReadOut,
            bytesFairMQReadOut: bytesFairMQReadOut,
            runs: runs,
        };
        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        const databaseObject = {
            name: entityObject.name,
            hostname: entityObject.hostname,
            nTimeframes: entityObject.nTimeframes,
            bytesProcessed: entityObject.bytesProcessed,
            bytesEquipmentReadOut: entityObject.bytesEquipmentReadOut,
            bytesRecordingReadOut: entityObject.bytesRecordingReadOut,
            bytesFairMQReadOut: entityObject.bytesFairMQReadOut,
            runs: entityObject.runs,
        };

        return databaseObject;
    }
}

module.exports = FlpAdapter;
