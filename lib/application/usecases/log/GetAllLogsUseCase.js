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

const { UseCase } = require('../../interfaces');
const { LogRepository } = require('../../interfaces/repositories');

/**
 * GetAllLogsUseCase
 */
class GetAllLogsUseCase extends UseCase {
    /**
     * Constructor
     */
    constructor() {
        super();

        // Load the default interface
        this.logRepository = new LogRepository();
    }

    /**
     * Sets the (DI) Log Repository.
     *
     * @param {Object} logRepository (DI) Log Repository
     * @returns {Object} Current UseCase
     */
    setLogRepository(logRepository) {
        this.logRepository = logRepository;
        return this;
    }

    /**
     * Executes this use case.
     *
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute() {
        return this.logRepository.findAll();
    }
}

module.exports = GetAllLogsUseCase;
