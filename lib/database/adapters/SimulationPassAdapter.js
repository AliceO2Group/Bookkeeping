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
 * SimulationPassAdapter
 */
class SimulationPassAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeSimulationPass} databaseObject Object to convert.
     * @returns {SimulationPass} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            name,
            jiraId,
            description,
            pwg,
            requestedEventsCount,
            generatedEventsCount,
            outputSize,
        } = databaseObject;

        const SimulationPassesCount = databaseObject.get('SimulationPassesCount');
        const runsCount = databaseObject.get('runsCount');

        return {
            id,
            name,
            jiraId,
            description,
            pwg,
            requestedEventsCount,
            generatedEventsCount,
            outputSize,
            runsCount,
            SimulationPassesCount,
        };
    }
}

module.exports = SimulationPassAdapter;
