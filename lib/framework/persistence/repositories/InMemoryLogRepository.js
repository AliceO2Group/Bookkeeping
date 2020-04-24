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
