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

        /**
         * @type {LhcFillStatisticsAdapter|null}
         */
        this.statisticsAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toSummary = this.toSummary.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeLhcFill} databaseObject Object to convert.
     * @returns {LhcFill} Converted entity object.
     */
    toEntity(databaseObject) {
        const { runs = [] } = databaseObject;
        const entity = this.toSummary(databaseObject);
        entity.runs = runs.map(this.runAdapter.toEntity);

        return entity;
    }

    /**
     * Adapts the fill entity to a minified version.
     * @param {SequelizeLhcFill} databaseObject fill object
     * @returns {MinifiedLSequelizeLhcFill} minified version of the fill entity
     */
    toSummary(databaseObject) {
        const {
            fillNumber,
            stableBeamsStart,
            stableBeamsEnd,
            stableBeamsDuration,
            beamType,
            fillingSchemeName,
            collidingBunchesCount,
            deliveredLuminosity,
            runs = [],
            statistics: sequelizeStatistics,
        } = databaseObject;

        const statistics = sequelizeStatistics ? this.statisticsAdapter.toEntity(sequelizeStatistics) : null;

        return {
            fillNumber,
            stableBeamsStart: stableBeamsStart ? new Date(stableBeamsStart).getTime() : stableBeamsStart,
            stableBeamsEnd: stableBeamsEnd ? new Date(stableBeamsEnd).getTime() : stableBeamsEnd,
            stableBeamsDuration,
            beamType,
            fillingSchemeName,
            collidingBunchesCount,
            deliveredLuminosity,
            statistics,
            runs: runs.map(this.runAdapter.toLhcFillSummary),
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
