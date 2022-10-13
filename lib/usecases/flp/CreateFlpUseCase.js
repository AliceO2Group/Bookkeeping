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

const { flpService } = require('../../server/services/flp/FlpService.js');

/**
 * CreateFlpUseCase
 */
class CreateFlpUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateFlpDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;
        const { runNumber } = body;

        try {
            const flp = await flpService.create(body, runNumber);
            return { result: flp };
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

module.exports = CreateFlpUseCase;
