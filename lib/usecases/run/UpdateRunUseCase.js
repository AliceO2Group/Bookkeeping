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

const { runService } = require('../../server/services/run/RunService.js');

/**
 * Update a run with provided values. For now we update only RunQuality
 */
class UpdateRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {UpdateRunDto} dto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, params, query } = dto;
        const { runId, runNumber = query?.runNumber } = params;

        try {
            const {
                eorReasons,
                tags: tagsTexts,
                detectorsQualities,
                runQualityChangeReason,
                calibrationStatusChangeReason,
                detectorsQualitiesChangeReason,
            } = body;
            delete body.eorReasons;
            delete body.tags;
            delete body.detectorsQualities;
            const run = await runService.update(
                { runNumber, runId },
                {
                    runPatch: body,
                    relations: { tagsTexts, eorReasons, userIdentifier: { externalUserId: dto?.session?.externalId }, detectorsQualities },
                    metadata: {
                        runQualityChangeReason: runQualityChangeReason?.trim(),
                        calibrationStatusChangeReason: calibrationStatusChangeReason?.trim(),
                        detectorsQualitiesChangeReason: detectorsQualitiesChangeReason?.trim(),
                    },
                },
            );

            return { result: run };
        } catch (error) {
            return {
                error: {
                    status: 500,
                    title: 'ServiceUnavailable',
                    detail: error.message || `Unable to update run with id ${runId ? runId : runNumber}`,
                },
            };
        }
    }
}

module.exports = UpdateRunUseCase;
