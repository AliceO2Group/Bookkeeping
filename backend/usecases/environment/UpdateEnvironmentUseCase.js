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

const { environmentService } = require('../../server/services/environment/EnvironmentService.js');

/**
 * UpdateEnvironmentUseCase
 */
class UpdateEnvironmentUseCase {
    /**
     * Executes this use case
     *
     * @param {UpdateEnvironmentUseCase} dto A dto containing the required data.
     * @returns {Promise} Promise object represents the result of this execution.
     */
    async execute(dto) {
        const { params: { envId: environmentId }, body: { toredownAt, status, statusMessage } } = dto;

        try {
            return { result: await environmentService.update(environmentId, { toredownAt }, { status, statusMessage }) };
        } catch (error) {
            return {
                error: {
                    status: '400',
                    title: error.message,
                },
            };
        }
    }
}

module.exports = UpdateEnvironmentUseCase;
