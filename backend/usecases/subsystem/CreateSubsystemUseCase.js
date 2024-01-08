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

const {
    repositories: {
        SubsystemRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { subsystemAdapter } = require('../../database/adapters/index.js');

/**
 * CreateSubsystemUseCase
 */
class CreateSubsystemUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateSubsystemDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { body } = dto;

        const subsystem = await TransactionHelper.provide(async () => {
            const queryBuilder = new QueryBuilder()
                .where('name').is(body.name);
            const subsystem = await SubsystemRepository.findOne(queryBuilder);
            if (subsystem) {
                return null;
            }

            return SubsystemRepository.insert(subsystemAdapter.toDatabase(body));
        });

        return subsystem ? subsystemAdapter.toEntity(subsystem) : null;
    }
}

module.exports = CreateSubsystemUseCase;
