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
 * EndRunUseCase
 */
class EndRunUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The EndRunDto containing all data.
     * @returns {Promise<{result: (Run|undefined), error: (Object|undefined)}>} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body, params } = dto;

        let runTypeName = null;
        if (body.runType) {
            runTypeName = body.runType;
            delete body.runType;
        }

        // Bad variable name, the parameter expect a run number
        const { runId: runNumber } = params;
        try {
            return { result: await runService.update({ runNumber }, body, { runTypeName }) };
        } catch (e) {
            return {
                error: {
                    status: '400',
                    title: e.message,
                },
            };
        }
    }
}

module.exports = EndRunUseCase;
