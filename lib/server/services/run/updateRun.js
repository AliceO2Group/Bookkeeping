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
const { createLog } = require('../log/createLog.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { getTagsByText } = require('../tag/getTagsByText.js');
const { formatServerDate } = require('../../utilities/formatServerDate.js');
const { RunQualities } = require('../../../domain/enums/RunQualities.js');
const { getRunDefinition } = require('./getRunDefinition.js');

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
    textParts.push(formatServerDate());

    // Do not tag log only for good and bad qualities
    const TAGGED_LOG_QUALITIES = [RunQualities.GOOD, RunQualities.BAD];

    let tags = [];
    if (TAGGED_LOG_QUALITIES.includes(previousQuality) && TAGGED_LOG_QUALITIES.includes(newQuality)) {
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
 * @param {SequelizeTag[]|null} [tags=null] if not null, overrides the tags applied to run
 * @param {User|null} [user=null] if not null, the user used to authenticate the update
 * @param {Transaction} [transaction] optionally an already existing transaction in which update must be performed
 * @return {Promise<SequelizeRun>} resolve with the updated run model
 */
exports.updateRun = async (identifier, runPatch, tags = null, user = null, transaction) => {
    const { fillNumber } = runPatch;

    const runModel = await getRunOrFail(
        identifier,
        (queryBuilder) => queryBuilder
            .include('tags')
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
    const previousRun = { runQuality: runModel?.runQuality };

    runPatch.definition = runPatch.definition ?? getRunDefinition({
        ...runModel.dataValues,
        ...Object.fromEntries(Object.entries(runPatch).filter(([_, value]) => value !== undefined)),
    });

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

        return runModel;
    }, { transaction });
};
