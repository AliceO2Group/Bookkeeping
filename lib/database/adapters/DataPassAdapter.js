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
 * DataPassAdapter
 */
class DataPassAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.toMinifiedEntity = this.toMinifiedEntity.bind(this);
        this.dataPassVersionAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeDataPass} databaseObject Object to convert.
     * @returns {DataPass} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            name,
            versions,
            skimmingStage,
            isFrozen,
        } = databaseObject;

        const runsCount = databaseObject.get('runsCount');
        const simulationPassesCount = databaseObject.get('simulationPassesCount');
        const pdpBeamTypes = databaseObject.get('pdpBeamTypes')?.split(',') || [];

        return {
            id,
            name,
            skimmingStage,
            versions: (versions ?? []).map(this.dataPassVersionAdapter.toEntity),
            pdpBeamTypes,
            runsCount,
            simulationPassesCount,
            isFrozen,
        };
    }

    /**
     * Converts the given database object to a minified entity object (only identification fields).
     *
     * @param {SequelizeDataPass} databaseObject Object to convert.
     * @returns {{id: number, name: string}} Converted minified entity object.
     */
    toMinifiedEntity({ id, name }) {
        return { id, name };
    }
}

module.exports = DataPassAdapter;
