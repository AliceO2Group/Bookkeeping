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
 * GetFlpsByRunUseCase
 */
class GetFlpsByRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetRunDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params: { runNumber } } = dto;
        const run = await runService.get({ runNumber }, { flpRoles: true });
        for (const flp of run?.flpRoles ?? []) {
            const { bytesEquipmentReadOut, nTimeframes } = flp;
            const { runDuration } = run;

            if (bytesEquipmentReadOut) {
                if (nTimeframes) {
                    flp.meanSTFSize = Math.floor(bytesEquipmentReadOut / nTimeframes);
                }
                if (run.runDuration) {
                    flp.dataRate = Math.floor(bytesEquipmentReadOut / (runDuration / 1000));
                }
            }
        }
        return run?.flpRoles;
    }
}

module.exports = GetFlpsByRunUseCase;
