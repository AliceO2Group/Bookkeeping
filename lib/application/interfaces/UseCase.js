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

/**
 * The software in this layer contains application specific business rules. It encapsulates and implements all of the
 * use cases of the system. These use cases orchestrate the flow of data to and from the entities, and direct those
 * entities to use their enterprise wide business rules to achieve the goals of the use case.
 */
class UseCase {
    /**
     * Executes this use case.
     *
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute() {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = UseCase;
