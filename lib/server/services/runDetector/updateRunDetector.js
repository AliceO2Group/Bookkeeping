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
const { utilities: { TransactionHelper } } = require('../../../database');

/**
 *
 * Update the given runDetector
 *
 * @param {number} runNumber the id of the run for the run detector to update
 * @param {number} detectorId the id of the detector for the run detector to update
 * @param {Partial<SequelizeRunDetector>} runDetectorPatch the patch to apply on the runDetector
 * @param {Object} [transaction] optionally the transaction in which one the log creation is executed
 * @return {Promise<SequelizeRunDetector>} resolve with the updated runDetector model
 */
exports.updateRunDetector = async (runNumber, detectorId, runDetectorPatch, transaction) => {
    const runDetectorModel = await TransactionHelper.provide(async () => getRunDetectorOrFail(runNumber, detectorId), { transaction });
    return await TransactionHelper.provide(
        async () =>
            RunDetectorsRepository.update(runDetectorModel, runDetectorPatch),
        { transaction },
    );
};
