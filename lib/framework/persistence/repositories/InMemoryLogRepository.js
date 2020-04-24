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

const { LogRepository } = require('../../../application/interfaces/repositories');

/**
 * InMemoryLogRepository
 */
class InMemoryLogRepository extends LogRepository {
    /**
     * Returns all entities.
     *
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAll() {
        const date = new Date().getTime();
        return Promise.resolve([
            {
                entryID: 1,
                authorID: 'Batman',
                title: 'Run1',
                creationTime: date,
                tags: ['Tag1', 'Tag2'],
                content: [
                    { content: 'Batman wrote this...', sender: 'Batman' },
                    { content: 'Nightwing wrote this...', sender: 'Nightwing' },
                    { content: 'Gordon wrote this...', sender: 'Commissioner Gordon' },
                ],
            },
            {
                entryID: 2,
                authorID: 'Joker',
                title: 'Run2',
                creationTime: date,
                tags: ['Tag2'],
                content: [{ content: 'Something about run2...', sender: 'Joker' }],
            },
            {
                entryID: 3,
                authorID: 'Anonymous',
                title: 'Run5',
                creationTime: date,
                tags: ['Tag3'],
                content: [{ content: 'Ipem lorum...', sender: 'Anonymous' }],
            },
        ]);
    }
}

module.exports = InMemoryLogRepository;
