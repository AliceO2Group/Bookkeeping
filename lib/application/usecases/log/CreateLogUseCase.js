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

const { IUseCase } = require('../../interfaces');
const {
    repositories: {
        LogRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../../database');

/**
 * CreateLogUseCase
 */
class CreateLogUseCase extends IUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} data The data that will be inserted.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(data) {
        return TransactionHelper.provide(() => LogRepository.insert(data));
    }
}

module.exports = CreateLogUseCase;
