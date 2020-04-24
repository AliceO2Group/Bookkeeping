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

const IAdapter = require('../../application/interfaces/adapters');
const { Log } = require('../../domain/entities');

/**
 * LogAdapter
 */
class LogAdapter extends IAdapter.LogAdapter {
    /**
     * Converts a persistence object to a domain object.
     *
     * @param {Object} persistenceObject the persistence object to convert.
     * @return {Object} The resulted domain object.
     */
    static toDomain(persistenceObject) {
        if (Array.isArray(persistenceObject)) {
            return persistenceObject.map((a) => this.toDomain(a));
        }

        return Object.assign(new Log(), {
            entryID: persistenceObject.id,
            authorID: 'Batman',
            title: persistenceObject.title,
            creationTime: new Date().getTime(),
            tags: ['Tag1', 'Tag2'],
            content: [
                { content: 'Batman wrote this...', sender: 'Batman' },
                { content: 'Nightwing wrote this...', sender: 'Nightwing' },
                { content: 'Gordon wrote this...', sender: 'Commissioner Gordon' },
            ],
        });
    }
}

module.exports = LogAdapter;
