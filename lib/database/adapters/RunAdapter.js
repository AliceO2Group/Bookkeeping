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
            id,
            runNumber,
            timeO2Start,
            timeO2End,
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
        } = databaseObject;

        const entityObject = {
            id: id,
            runNumber: runNumber,
            timeO2Start: timeO2Start,
            timeO2End: timeO2End,
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
            timeO2Start: entityObject.O2StartTime,
            timeO2End: entityObject.O2EndTime,
            timeTrgStart: entityObject.TrgStartTime,
            timeTrgEnd: entityObject.TrgEndTime,
            activityId: entityObject.activityId,
            runType: entityObject.runType,
            runQuality: entityObject.runQuality,
            nDetectors: entityObject.nDetectors,
            nFlps: entityObject.nFlps,
            nEpns: entityObject.nEpns,
            nSubtimeframes: entityObject.nSubtimeframes,
            bytesReadOut: entityObject.bytesReadOut,
        };

        return databaseObject;
    }
}

module.exports = RunAdapter;
