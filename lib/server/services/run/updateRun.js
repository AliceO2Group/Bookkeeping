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

const RunRepository = require('../../../database/repositories/RunRepository.js');
const { getRunOrFail } = require('./getRunOrFail.js');
const { utilities: { TransactionHelper } } = require('../../../database');
const { checkLhcFill } = require('../../../usecases/lhcFill/checkLhcFill.js');
const RunTagsRepository = require('../../../database/repositories/RunTagsRepository.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { getRunDefinition, RunDefinition } = require('./getRunDefinition.js');
const { DEFAULT_RUN_CALIBRATION_STATUS, RunCalibrationStatus } = require('../../../domain/enums/RunCalibrationStatus.js');
const { logQualityChange } = require('./logEntriesCreation/logQualityChange.js');
const { logCalibrationStatusChange } = require('./logEntriesCreation/logCalibrationStatusChange.js');

/**
 * Update the given run
 *
 * @param {RunIdentifier} identifier the identifier of the run to update
 * @param {Partial<SequelizeRun>} runPatch the patch to apply on the run
 * @param {SequelizeTag[]|null} [tags=null] if not null, overrides the tags applied to run
 * @param {User|null} [user=null] if not null, the user used to authenticate the update
 * @param {object} [transaction] optionally an already existing transaction in which update must be performed
 * @return {Promise<SequelizeRun>} resolve with the updated run model
 */
exports.updateRun = async (identifier, runPatch, tags = null, user = null, transaction) => {
    const { fillNumber } = runPatch;

    const runModel = await getRunOrFail(
        identifier,
        (queryBuilder) => queryBuilder
            .include('tags')
            .include('detectors')
            .include('lhcFill')
            .include('runType'),
    );
    const { id: runId } = runModel;

    await checkLhcFill(fillNumber, true);

    // The run quality can only be updated if the run has ended
    const runEnd = runModel.timeTrgEnd ?? runModel.timeO2End;
    const patchEnd = runPatch.timeTrgEnd ?? runPatch.timeO2End;
    if (
        !runEnd
        && !patchEnd
        && runPatch.runQuality
        && runPatch.runQuality !== runModel.runQuality
    ) {
        throw new BadParameterError('Run quality can not be updated on a run that has not ended yet');
    }

    // Store the run quality to create a log if it changed
    const previousRun = { runQuality: runModel?.runQuality, calibrationStatus: runModel?.calibrationStatus };

    runPatch.definition = runPatch.definition ?? getRunDefinition({
        ...runModel.dataValues,
        ...Object.fromEntries(Object.entries(runPatch).filter(([_, value]) => value !== undefined)),
    });

    // If trying to set calibration status of a non-calibration run, throws
    if (runPatch.definition === RunDefinition.Calibration) {
        runPatch.calibrationStatus = runPatch.calibrationStatus ?? DEFAULT_RUN_CALIBRATION_STATUS;
    } else if (runPatch.calibrationStatus) {
        throw new BadParameterError('Calibration status is reserved to calibration runs');
    }

    // If run was calibration and definition change, set the calibration status to null
    if (runModel.calibrationStatus && runPatch.definition !== RunDefinition.Calibration) {
        runPatch.calibrationStatus = null;
    }

    return TransactionHelper.provide(async (transaction) => {
        await RunRepository.update(runModel, runPatch);

        // TODO move this in RunService
        if (tags) {
            // Check that tags are either not archived, or either archived but already in the run
            for (const newTag of tags) {
                if (newTag.archived && !runModel.tags.find(({ text }) => text === newTag.text)) {
                    throw new Error('Archived tags can not be used when updating run');
                }
            }

            // Remove existing tags of the run and insert new ones
            await RunTagsRepository.removeById(runId).then(() => RunTagsRepository.insertMany(tags.map((tag) => ({
                runId,
                tagId: tag.id,
            }))));
        }

        // Send notification if run quality has changed
        if (previousRun.runQuality !== runModel.runQuality) {
            await logQualityChange(runModel.runNumber, previousRun.runQuality, runModel.runQuality, transaction, user);
        }

        if (previousRun.calibrationStatus !== runModel.calibrationStatus) {
            if (runModel.calibrationStatus === RunCalibrationStatus.FAILED) {
                await logCalibrationStatusChange(
                    runModel.runNumber,
                    previousRun.calibrationStatus,
                    runModel.calibrationStatus,
                    runModel.detectors,
                    transaction,
                    user,
                );
            }
        }

        return runModel;
    }, { transaction });
};
