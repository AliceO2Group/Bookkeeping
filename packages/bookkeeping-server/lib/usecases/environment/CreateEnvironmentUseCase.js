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
const { ConflictError } = require('../../server/errors/ConflictError.js');

/**
 * CreateEnvironmentUseCase
 */
class CreateEnvironmentUseCase {
    /**
     * Executes this use case.
     *
     * @param {CreateEnvironmentDto} dto The CreateLogDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body: { envId, createdAt, status, statusMessage } } = dto;

        try {
            return { result: await environmentService.create({ id: envId, createdAt }, { status, statusMessage }) };
        } catch (error) {
            let response = {
                status: '400',
                title: error.message,
            };

            if (error instanceof ConflictError) {
                response = {
                    status: '409',
                    source: { pointer: '/data/attributes/body/envId' },
                    title: 'Conflict',
                    detail: 'The provided entity already exists',
                };
            }

            return { error: response };
        }
    }
}

module.exports = CreateEnvironmentUseCase;
