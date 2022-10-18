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

const { runDetectorsAdapter } = require('../../../database/adapters/index.js');
const { getRunDetector } = require('./getRunDetector.js');
const { updateRunDetector } = require('./updateRunDetector.js');

/**
 * Global service to handle run detector instances
 */
class RunDetectorService {
    /**
     * Find and return an run detector by its id
     *
     * @param {number} runNumber, the runNumber of the run detector to find
     * @param {number} detectorId, the id of the run detector to find
     * @return {Promise<RunDetector|null>} resolve with the run detector found or null
     */
    async get(runNumber, detectorId) {
        const runDetector = await getRunDetector(runNumber, detectorId);

        return runDetector ? runDetectorsAdapter.toEntity(runDetector) : null;
    }

    /**
     * Update the given runDetector
     *
     * @param {number} runNumber the identifier of the runDetector to update
     * @param {number} detectorId the identifier of the detector to update run detector
     * @param {Partial<RunDetector>} runDetectorPatch the patch to apply on the run Detector
     * @return {Promise<RunDetector>} resolve with the resulting runDetector
     */
    async update(runNumber, detectorId, runDetectorPatch) {
        await updateRunDetector(runNumber, detectorId, runDetectorsAdapter.toDatabase(runDetectorPatch));
        return this.get(runNumber, detectorId);
    }
}

exports.RunDetectorService = RunDetectorService;

exports.runDetectorService = new RunDetectorService();
