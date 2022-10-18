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

const { RunDetectorsRepository } = require('../../../database/repositories');
const { getRunDetectorOrFail } = require('./getRunDetectorOrFail');

/**
 * Update the given runDetector
 *
 * @param {string} runNumber the id of the run for the run detector to update
 * @param {string} detectorId the id of the detector for the run detector to update
 * @param {Partial<SequelizeRunDetector>} runDetectorPatch the patch to apply on the runDetector
 * @return {Promise<SequelizeRunDetector>} resolve with the updated runDetector model
 */
exports.updateRunDetector = async (runNumber, detectorId, runDetectorPatch) => {
    const runDetectorModel = await getRunDetectorOrFail(runNumber, detectorId);
    await RunDetectorsRepository.update(runDetectorModel, runDetectorPatch);
    return runDetectorModel;
};
