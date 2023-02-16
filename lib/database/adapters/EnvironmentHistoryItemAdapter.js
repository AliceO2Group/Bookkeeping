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

/**
 * Adapter for environment history item
 */
class EnvironmentHistoryItemAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {EnvironmentAdapter|null}
         */
        this.environmentAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     * @param {SequelizeEnvironmentHistoryItem} databaseObject Object to convert.
     * @returns {EnvironmentHistoryItem} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            environmentId,
            createdAt,
            updatedAt,
            status,
            statusMessage,
            environment,
        } = databaseObject;

        return {
            id,
            environmentId,
            status: status,
            statusMessage: statusMessage,
            environment: environment ? this.environmentAdapter.toEntity(environment) : null,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };
    }

    /**
     * Converts the given entity object to a database object
     *
     * @param {Partial<EnvironmentHistoryItem>} entityObject Object to convert.
     * @returns {Partial<SequelizeEnvironmentHistoryItem>} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            id: entityObject.id,
            environmentId: entityObject.environmentId,
            status: entityObject.status,
            statusMessage: entityObject.statusMessage,
        };
    }
}

module.exports = EnvironmentHistoryItemAdapter;
