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
class RunAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            runNumber,
            time02Start,
            time02End,
            timeTrgStart,
            timeTrgEnd,
            activityId,
            runType,
            runQuality,
            nDetectors,
            nFlps,
            nEpns,
            nSubtimeframes,
            bytesReadOut,
            bytesTimeframe_builder,
        } = databaseObject;

        const entityObject = {
            runNumber: runNumber,
            time02Start: time02Start,
            time02End: time02End,
            timeTrgStart: timeTrgStart,
            timeTrgEnd: timeTrgEnd,
            activityId: activityId,
            runType: runType,
            runQuality: runQuality,
            nDetectors: nDetectors,
            nFlps: nFlps,
            nEpns: nEpns,
            nSubtimeframes: nSubtimeframes,
            bytesReadOut: bytesReadOut,
            bytesTimeframe_builder: bytesTimeframe_builder,
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
            runNumber: entityObject.runNumber,
            time02Start: entityObject.time02Start,
            time02End: entityObject.time02End,
            timeTrgStart: entityObject.timeTrgStart,
            timeTrgEnd: entityObject.timeTrgEnd,
            activityId: entityObject.activityId,
            runType: entityObject.runType,
            runQuality: entityObject.runQuality,
            nDetectors: entityObject.nDetectors,
            nFlps: entityObject.nFlps,
            nEpns: entityObject.nEpns,
            nSubtimeframes: entityObject.nSubtimeframes,
            bytesReadOut: entityObject.bytesReadOut,
            bytesTimeframe_builder: entityObject.bytesTimeframe_builder,
        };

        if (entityObject.rootRunId) {
            databaseObject.rootRunId = entityObject.rootRunId;
        }

        if (entityObject.parentRunId) {
            databaseObject.parentRunId = entityObject.parentRunId;
        }

        return databaseObject;
    }
}

module.exports = RunAdapter;
