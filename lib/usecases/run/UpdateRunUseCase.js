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
const { BadParameterError } = require('../../server/errors/BadParameterError.js');

/**
 * Update a run with provided values. For now we update only RunQuality
 */
class UpdateRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {UpdateRunDto} dto containing all data.
     * @returns {Promise<Run>} resolves with the updated run
     * @throws {BadParameterError} if end of run reasons are updated without a user in the session
     * @throws {NotFoundError} if the run or the session user does not exist
     */
    async execute(dto) {
        const { body, params = {}, query = {} } = dto;
        const { runNumber = query.runNumber } = params;

        const {
            eorReasons,
            tags: tagsTexts,
            detectorsQualities,
            runQualityChangeReason,
            calibrationStatusChangeReason,
            detectorsQualitiesChangeReason,
            phaseShiftAtStart,
            phaseShiftAtEnd,
        } = body;
        delete body.eorReasons;
        delete body.tags;
        delete body.detectorsQualities;
        delete body.phaseShiftAtStart;
        delete body.phaseShiftAtEnd;

        const externalUserId = dto?.session?.externalId;
        if (eorReasons && (externalUserId === undefined || externalUserId === null)) {
            throw new BadParameterError('A user is required to update the end of run reasons');
        }

        body.phaseShiftAtStartBeam1 = phaseShiftAtStart?.beam1;
        body.phaseShiftAtStartBeam2 = phaseShiftAtStart?.beam2;
        body.phaseShiftAtEndBeam1 = phaseShiftAtEnd?.beam1;
        body.phaseShiftAtEndBeam2 = phaseShiftAtEnd?.beam2;

        // The existence of the user is checked by the run service
        return runService.update(
            { runNumber },
            {
                runPatch: body,
                relations: { tagsTexts, eorReasons, userIdentifier: { externalUserId }, detectorsQualities },
                metadata: {
                    runQualityChangeReason: runQualityChangeReason?.trim(),
                    calibrationStatusChangeReason: calibrationStatusChangeReason?.trim(),
                    detectorsQualitiesChangeReason: detectorsQualitiesChangeReason?.trim(),
                },
            },
        );
    }
}

module.exports = UpdateRunUseCase;
