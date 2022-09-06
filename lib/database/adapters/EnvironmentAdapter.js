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

const RunAdapter = require('./RunAdapter');

/**
 * EnvironmentAdapter
 */
class EnvironmentAdapter {
    /**
     * Converts the given database object to an entity object.
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            id,
            toredownAt,
            createdAt,
            updatedAt,
            status,
            statusMessage,
            runs,
        } = databaseObject;

        const entityObject = {
            id: id,
            toredownAt: new Date(toredownAt).getTime(),
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
            status: status,
            statusMessage: statusMessage,
        };
        if (runs) {
            entityObject.runs = runs.map(RunAdapter.toMinifiedEntity);
        } else {
            entityObject.runs = [];
        }
        return entityObject;
    }

    /**
     * Converts the given entity object to a database object
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        return {
            id: entityObject.envId,
            createdAt: entityObject.createdAt,
            status: entityObject.status,
            statusMessage: entityObject.statusMessage,
        };
    }
}

module.exports = EnvironmentAdapter;
