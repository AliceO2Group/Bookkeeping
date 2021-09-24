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
            environmentId,
            runType,
            runQuality,
            nDetectors,
            nFlps,
            nEpns,
            nSubtimeframes,
            bytesReadOut,
            dd_flp,
            dcs,
            epn,
            epnTopology,
            tags,
        } = databaseObject;

        const entityObject = {
            id: id,
            runNumber: runNumber,
            timeO2Start: new Date(timeO2Start).getTime(),
            timeO2End: new Date(timeO2End).getTime(),
            timeTrgStart: new Date(timeTrgStart).getTime(),
            timeTrgEnd: new Date(timeTrgEnd).getTime(),
            environmentId: environmentId,
            runType: runType,
            runQuality: runQuality,
            nDetectors: nDetectors,
            nFlps: nFlps,
            nEpns: nEpns,
            dd_flp: dd_flp,
            dcs: dcs,
            epn: epn,
            epnTopology: epnTopology,
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
            environmentId: entityObject.environmentId,
            runType: entityObject.runType,
            runQuality: entityObject.runQuality,
            nDetectors: entityObject.nDetectors,
            nFlps: entityObject.nFlps,
            nEpns: entityObject.nEpns,
            nSubtimeframes: entityObject.nSubtimeframes,
            bytesReadOut: entityObject.bytesReadOut,
            dd_flp: entityObject.dd_flp,
            dcs: entityObject.dcs,
            epn: entityObject.epn,
            epnTopology: entityObject.epnTopology,
            tags: entityObject.tags,
        };

        return databaseObject;
    }
}

module.exports = RunAdapter;
