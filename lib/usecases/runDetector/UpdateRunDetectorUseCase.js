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

const { runDetectorService } = require('../../server/services/runDetector/RunDetectorService');
const {
    utilities: {
        TransactionHelper,
    },
} = require('../../database');

/**
 * Update run detector use case
 */
class UpdateRunDetectorUseCase {
    /**
     * Executes this use case
     * @param {Object} dto The UpdateTagDto containing the values that needs to be updated.
     * @returns {Promise} Promise object that represents the result of the update.
     */
    async execute(dto) {
        const { body, params } = dto;
        const { runNumber, detectorId } = params;
        try {
            return {
                result: await TransactionHelper.provide(async () => runDetectorService.update(runNumber, detectorId, body)),
            };
        } catch (error) {
            return {
                error: {
                    status: error.status || 400,
                    title: 'Conflict',
                    detail: error.message || 'Unable to update the given detector',
                },
            };
        }
    }
}

module.exports = UpdateRunDetectorUseCase;
