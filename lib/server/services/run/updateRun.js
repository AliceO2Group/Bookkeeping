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
const { logRunQualityChange } = require('./logEntriesCreation/logRunQualityChange.js');
const { logCalibrationStatusChange } = require('./logEntriesCreation/logCalibrationStatusChange.js');
const { RunQualities } = require('../../../domain/enums/RunQualities.js');
const { getLhcPeriodOrFail } = require('../lhcPeriod/getLhcPeriodOrFail.js');

/**
 * Update the given run
 *
 * @param {RunIdentifier} identifier the identifier of the run to update
 * @param {object} payload the update payload
 * @param {Partial<SequelizeRun>} [payload.runPatch] the patch to apply on the run
 * @param {object} [payload.relations] relation's patch to apply
 * @param {SequelizeTag[]|null} [payload.relations.tags] if not null, overrides the tags applied to run
 * @param {User|null} [payload.relations.user] if not null, the user used to authenticate the update
 * @param {object} [payload.metadata] optional run update's metadata
 * @param {string} [payload.metadata.runQualityChangeReason] if it applies, the reason of the calibration change
 * @param {string} [payload.metadata.calibrationStatusChangeReason] if it applies, the reason of the calibration change
 * @param {object} [transaction] optionally an already existing transaction in which update must be performed
 * @return {Promise<SequelizeRun>} resolve with the updated run model
 */
exports.updateRun = async (identifier, payload, transaction) => {
    const { runPatch = {}, relations = {}, metadata = {} } = payload;
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

    if (runPatch.definition === RunDefinition.Calibration) {
        if (runModel.definition !== RunDefinition.Calibration) {
            runPatch.calibrationStatus = runPatch.calibrationStatus ?? DEFAULT_RUN_CALIBRATION_STATUS;
        }
    } else if (runPatch.calibrationStatus) {
        throw new BadParameterError('Calibration status is reserved to calibration runs');
    }

    // If run was calibration and definition change, set the calibration status to null
    if (runModel.calibrationStatus && runPatch.definition !== RunDefinition.Calibration) {
        runPatch.calibrationStatus = null;
    }

    return TransactionHelper.provide(async (transaction) => {
        await RunRepository.update(runModel, runPatch);

        const { tags, user } = relations || {};

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
            const { runQualityChangeReason } = metadata;

            const { lhcPeriodId } = runModel;
            const lhcPeriod = await getLhcPeriodOrFail(lhcPeriodId);
            const lhcPeriodName = lhcPeriod?.name ?? 'UNKNOWN';

            if (!runQualityChangeReason
                && !(previousRun.runQuality === RunQualities.NONE
                    && (runModel.runQuality === RunQualities.GOOD || runModel.runQuality === RunQualities.TEST))
            ) {
                throw new BadParameterError('Run quality change require a reason');
            }
            await logRunQualityChange(
                runModel.runNumber,
                previousRun.runQuality,
                runModel.runQuality,
                transaction,
                user,
                runQualityChangeReason,
                lhcPeriodName,
            );
        }

        if (previousRun.calibrationStatus !== runModel.calibrationStatus) {
            const { calibrationStatusChangeReason } = metadata;

            if (previousRun.calibrationStatus === RunCalibrationStatus.FAILED || runModel.calibrationStatus === RunCalibrationStatus.FAILED) {
                //Log only when calibration status gone from/to failed
                if (!calibrationStatusChangeReason) {
                    throw new BadParameterError('Calibration status change require a reason'
                        + ` when changing from/to ${RunCalibrationStatus.FAILED}`);
                }

                await logCalibrationStatusChange(
                    runModel.runNumber,
                    previousRun.calibrationStatus,
                    runModel.calibrationStatus,
                    runModel.detectors,
                    transaction,
                    user,
                    calibrationStatusChangeReason,
                );
            } else if (calibrationStatusChangeReason) {
                // Do not allow calibration status change reason if we were not in failed status or going to failed status
                throw new BadParameterError('Calibration status change reason can only be specified'
                    + ` when changing from/to ${RunCalibrationStatus.FAILED}`);
            }
        }

        return runModel;
    }, { transaction });
};
