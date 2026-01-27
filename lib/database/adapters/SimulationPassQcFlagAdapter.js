/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { AdapterError } = require('../../server/errors/AdapterError.js');

/**
 * Adapter for simulation pass QC flag
 */
class SimulationPassQcFlagAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);

        this.qcFlagAdapter = null;
        this.simulationPassAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeSimulationPassQcFlag} databaseObject Object to convert.
     * @returns {SimulationPassQcFlag} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            simulationPassId,
            qualityControlFlagId,
            qcFlag,
            simulationPass,
        } = databaseObject;

        if (qcFlag === null) {
            throw new AdapterError('Related QC flag missing in SimulationPassQcFlag.');
        }

        return {
            ...this.qcFlagAdapter.toEntity(qcFlag),
            simulationPassId,
            qcFlagId: qualityControlFlagId,
            simulationPass: simulationPass ? this.simulationPassAdapter.toEntity(simulationPass) : null,
        };
    }
}

exports.SimulationPassQcFlagAdapter = SimulationPassQcFlagAdapter;
