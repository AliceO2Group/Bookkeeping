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
    adapters: {
        ReasonTypeAdapter,
    },
} = require('../../domain');
const {
    repositories: {
        ReasonTypeRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetAllReasonTypesUseCase
 * Retrieve a list of generic reason-types which are to be linked with end-of-run reasons
 */
class GetAllReasonTypesUseCase {
    /**
     * Executes this use case.
     * @returns {Promise<Array<JSON>, Error>} Promise object represents the result of this use case.
     */
    async execute() {
        const queryBuilder = new QueryBuilder();

        const reasonTypes = await TransactionHelper.provide(() => ReasonTypeRepository.findAll(queryBuilder));
        return reasonTypes ?
            reasonTypes.map(ReasonTypeAdapter.toEntity) : null;
    }
}

module.exports = GetAllReasonTypesUseCase;
