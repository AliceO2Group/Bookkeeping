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

const TagAdapter = require('./TagAdapter');

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
            tags,
        } = databaseObject;

        const entityObject = {
            id: id,
            runNumber: runNumber,
            timeO2Start: new Date(timeO2Start).getTime() / 1000,
            timeO2End: new Date(timeO2End).getTime() / 1000,
            timeTrgStart: new Date(timeTrgStart).getTime() / 1000,
            timeTrgEnd: new Date(timeTrgEnd).getTime() / 1000,
            activityId: activityId,
            runType: runType,
            runQuality: runQuality,
            nDetectors: nDetectors,
            nFlps: nFlps,
            nEpns: nEpns,
            nSubtimeframes: nSubtimeframes,
            bytesReadOut: bytesReadOut,
        };

        if (tags) {
            entityObject.tags = tags.map(TagAdapter.toEntity);
        } else {
            entityObject.tags = [];
        }

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
            timeO2Start: entityObject.timeO2Start,
            timeO2End: entityObject.timeO2End,
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
            tags: entityObject.tags,
        };

        return databaseObject;
    }
}

module.exports = RunAdapter;
