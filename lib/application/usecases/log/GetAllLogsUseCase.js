/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { UseCase } = require('../../interfaces');
const { LogRepository } = require('../../interfaces/repositories');

/**
 * GetAllLogsUseCase
 */
class GetAllLogsUseCase extends UseCase {
    /**
     * constructor
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
