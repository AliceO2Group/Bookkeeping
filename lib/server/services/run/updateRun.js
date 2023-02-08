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
const EorReasonRepository = require('../../../database/repositories/EorReasonRepository.js');
const ReasonTypeRepository = require('../../../database/repositories/ReasonTypeRepository.js');
const { createLog } = require('../log/createLog.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { getTagsByText } = require('../tag/getTagsByText.js');
const { getRunDefinition, RunDefinition } = require('./getRunDefinition.js');
const { formatServerDate } = require('../../utilities/formatServerDate.js');

/**
 * Method to remove existing reason_type - run_id from `eor_reasons` table and insert new ones
 * @param {Number} runId - id of the run that is due to be modified
 * @param {SequelizeEorReason[]} eorReasons - list of eor_reasons to be updated on the RUN
 * @returns {Promise<undefined|Error>} - promise on result of db queries
 */
const updateEorReasonsOnRun = async (runId, eorReasons) => {
    let reasonTypes = await ReasonTypeRepository.findAll();
    reasonTypes = reasonTypes.map((reason) => reason.id);
    const allReceivedReasonsExists = eorReasons.every((eorReason) => reasonTypes.includes(eorReason.reasonTypeId));
    const allReasonsMatchRunId = eorReasons.every((eorReason) => eorReason.runId === runId);
    if (!allReceivedReasonsExists) {
        throw new Error('Provided reason types do not exist');
    } else if (!allReasonsMatchRunId) {
        throw new Error('Multiple run ids parameters passed in eorReasons list. Please send updates for one run only');
    }

    const toKeepEorReasons = []; // EorReasons with an ID already, means exist in DB;
    const newEorReasons = []; // EorReasons with no ID, need to be added in DB;
    eorReasons.forEach((eorReason) => {
        if (eorReason.id) {
            toKeepEorReasons.push(eorReason.id);
        } else {
            newEorReasons.push(eorReason);
        }
    });
    await EorReasonRepository.removeByRunIdAndKeepIds(runId, toKeepEorReasons);
    await EorReasonRepository.addMany(newEorReasons);
};

/**
 * Create a log stating the run quality change
 *
 * @param {number} runNumber the run number of the run
 * @param {string} previousQuality the quality before update
 * @param {string} newQuality the quality after update
 * @param {Object} transaction the current transaction
 * @param {User|null} user if not null, the user mentioned in the log as the author of the update
 * @return {Promise<void>} resolve when log has been created
 * @private
 */
const logQualityChange = async (runNumber, previousQuality, newQuality, transaction, user) => {
    const textParts = [`The run quality for run ${runNumber} has been changed from ${previousQuality} to ${newQuality}`];
    if (user) {
        textParts.push(`by ${user.name}`);
    }
    textParts.push(`on ${formatServerDate()} at ${formatServerDate()}`);

    // Do not tag log for test quality
    const untaggedLogQuality = 'test';

    let tags = [];
    if (previousQuality !== untaggedLogQuality && newQuality !== untaggedLogQuality) {
        tags = (await getTagsByText(['DPG', 'RC'])).map(({ text }) => text);
    }

    const { error } = await createLog(
        {
            title: `Run ${runNumber} quality has changed to ${newQuality}`,
            text: textParts.join(' '),
            subtype: 'run',
            origin: 'process',
        },
        [runNumber],
        tags,
        [],
        transaction,
    );
    if (error) {
        // TODO log the failed log creation
    }
};

/**
 * Update the given run
 *
 * @param {RunIdentifier} identifier the identifier of the run to update
 * @param {Partial<SequelizeRun>} runPatch the patch to apply on the run
 * @param {SequelizeTag[]|null} tags if not null, overrides the tags applied to run
 * @param {SequelizeEorReason[]|null} eorReasons if not null, the list of end of run reasons to apply to the run (will replace existing ones)
 * @param {User|null} user if not null, the user used to authenticate the update
 * @param {Transaction} transaction optionally an already existing transaction in which update must be performed
 * @return {Promise<SequelizeRun>} resolve with the updated run model
 */
exports.updateRun = async (identifier, runPatch, tags, eorReasons, user, transaction) => {
    const { fillNumber } = runPatch;

    const runModel = await getRunOrFail(identifier, (queryBuilder) => queryBuilder.include('tags').include('lhcFill'));
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

    // When a physics run ends, set its quality to good as default to avoid deletion by mistake
    if (!runEnd && patchEnd && !runPatch.runQuality) {
        if (getRunDefinition(runModel) === RunDefinition.Physics) {
            runPatch.runQuality = 'good';
        }
    }

    // Store the run quality to create a log if it changed
    const previousRun = { runQuality: runModel?.runQuality };

    return TransactionHelper.provide(async (transaction) => {
        await RunRepository.update(runModel, runPatch);

        // TODO move this in RunService
        if (eorReasons) {
            await updateEorReasonsOnRun(runId, eorReasons);
        }

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

        return runModel;
    }, { transaction });
};
