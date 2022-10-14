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
 * LhcFillAdapter
 */
class LhcFillAdapter {
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
     * @param {SequelizeLhcFill} databaseObject Object to convert.
     * @returns {LhcFill} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            fillNumber,
            stableBeamsStart,
            stableBeamsEnd,
            stableBeamsDuration,
            beamType,
            fillingSchemeName,
            runs: sequelizeRuns,
        } = databaseObject;

        const runs = (sequelizeRuns || []).map(this.runAdapter.toEntity);

        return {
            fillNumber,
            stableBeamsStart: new Date(stableBeamsStart).getTime(),
            stableBeamsEnd: new Date(stableBeamsEnd).getTime(),
            stableBeamsDuration,
            beamType,
            fillingSchemeName,
            runs,
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<LhcFill>} entityObject Object to convert.
     * @returns {Partial<SequelizeLhcFill>} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            fillNumber: entityObject.fillNumber,
            stableBeamsStart: entityObject.stableBeamsStart,
            stableBeamsEnd: entityObject.stableBeamsEnd,
            stableBeamsDuration: entityObject.stableBeamsDuration,
            beamType: entityObject.beamType,
            fillingSchemeName: entityObject.fillingSchemeName,
        };
    }
}

exports.LhcFillAdapter = LhcFillAdapter;
