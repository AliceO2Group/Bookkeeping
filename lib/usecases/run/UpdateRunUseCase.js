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
const { runDetectorService } = require('../../server/services/runDetector/RunDetectorService.js');

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
        const runId = params ? params.runId : null;
        const runNumber = query ? query.runNumber : null;

        try {
            const { eorReasons, tags: tagsTexts, detectorsQualities } = body;
            delete body.eorReasons;
            delete body.tags;
            delete body.detectorsQualities;
            const run = await {
                result: await runService.update(
                    { runNumber, runId },
                    body,
                    { tagsTexts, eorReasons, userIdentifier: { externalUserId: dto?.session?.externalId } },
                ),
            };
            if (detectorsQualities) {
                for (const detector of detectorsQualities) {
                    await runDetectorService.update(
                        run.result.runNumber,
                        detector.detectorId,
                        { quality: detector.quality },
                    );
                }
            }
            return run;
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
