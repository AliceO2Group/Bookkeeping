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

/**
 * DeleteSubsystemUseCase
 */
class DeleteSubsystemUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllSubsystems DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { params } = dto;
        const { subsystemId } = params;

        queryBuilder.where('id').is(subsystemId);

        return TransactionHelper.provide(() => SubsystemRepository.removeOne(queryBuilder));
    }
}

module.exports = DeleteSubsystemUseCase;
