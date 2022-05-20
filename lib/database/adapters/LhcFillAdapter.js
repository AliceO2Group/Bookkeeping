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
const RunAdapter = require('./RunAdapter');

/**
 * LhcFillAdapter
 */
class LhcFillAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            fillNumber,
            stableBeamsStart,
            stableBeamsEnd,
            stableBeamsDuration,
            beamType,
            fillingSchemeName,
            runs,
        } = databaseObject;

        const entityObject = {
            fillNumber: fillNumber,
            stableBeamsStart: new Date(stableBeamsStart).getTime(),
            stableBeamsEnd: new Date(stableBeamsEnd).getTime(),
            stableBeamsDuration: stableBeamsDuration,
            beamType: beamType,
            fillingSchemeName: fillingSchemeName,
        };

        if (runs) {
            entityObject.runs = runs.map(RunAdapter.toEntity);
        } else {
            entityObject.runs = [];
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
            fillNumber: entityObject.fillNumber,
            stableBeamsStart: entityObject.stableBeamsStart,
            stableBeamsEnd: entityObject.stableBeamsEnd,
            stableBeamsDuration: entityObject.stableBeamsDuration,
            beamType: entityObject.beamType,
            fillingSchemeName: entityObject.fillingSchemeName,
        };

        return databaseObject;
    }
}

module.exports = LhcFillAdapter;
