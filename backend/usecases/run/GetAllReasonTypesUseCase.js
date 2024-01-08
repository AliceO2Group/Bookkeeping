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
        ReasonTypeRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');
const { reasonTypeAdapter } = require('../../database/adapters/index.js');

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
        const reasonTypes = await TransactionHelper.provide(() => ReasonTypeRepository.findAll());
        return reasonTypes ? reasonTypes.map(reasonTypeAdapter.toEntity) : null;
    }
}

module.exports = GetAllReasonTypesUseCase;
