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

const { getRun } = require('./getRun.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const RunRepository = require('../../../database/repositories/RunRepository.js');
const RunDetectorsRepository = require('../../../database/repositories/RunDetectorsRepository.js');
const TransactionHelper = require('../../../database/utilities/TransactionHelper.js');

/**
 * Create a run in the database and return the auto generated id
 *
 * @param {Partial<SequelizeRun>} newRun the run to create
 * @param {SequelizeDetector[]|null} detectors if not null, creates the detectors applied to the run
 * @param {Object} [transaction] optionally the transaction in which one the log creation is executed
 * @return {Promise<number>} resolve once the creation is done providing the id of the run that have been (or will be) created
 */
exports.createRun = async (newRun, detectors, transaction) => {
    const { runNumber, id: runId } = newRun;
    if (runNumber || runId) {
        const existingRun = await getRun({ runNumber, runId });
        if (existingRun) {
            throw new ConflictError(`A run already exists with ${runNumber ? 'run number' : 'id'} ${runNumber ?? runId}`);
        }
    }
    if (detectors) {
        await TransactionHelper.provide(async () => RunDetectorsRepository.insertMany(detectors.map((detector) => ({
            runNumber,
            detectorId: detector.id,
            quality: 'good',
        }))), { transaction });
    }
    const run = await TransactionHelper.provide(() => RunRepository.insert(newRun));
    return run;
};
