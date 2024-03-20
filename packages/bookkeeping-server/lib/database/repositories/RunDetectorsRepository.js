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

const {
    models: {
        RunDetectors,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the RunDetectorsRepository.
 */
class RunDetectorsRepository extends Repository {
    /**
     * Creates a new `RunDetectorsRepository` instance.
     */
    constructor() {
        super(RunDetectors);
    }

    /**
     * Remove all detectors & runs relations by run id
     * @param {number} runNumber  - run ID to delete detectors for
     * @return {Promise<void>} - delete result
     */
    async removeByRunNumber(runNumber) {
        return RunDetectors.sequelize.getQueryInterface().bulkDelete('run_detectors', { runNumber: runNumber });
    }

    /**
     * Update run detectors by runNumber
     * @param {Array} entities - Detectors & runNumber to associate
     * @return {*} Result of updating
     */
    async insertMany(entities) {
        return RunDetectors.bulkCreate(entities, { returning: true });
    }
}

module.exports = new RunDetectorsRepository();
