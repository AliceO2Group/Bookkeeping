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
 * EnvironmentAdapter
 */
class EnvironmentAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {RunAdapter|null}
         */
        this.runAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     * @param {SequelizeEnvironment} databaseObject Object to convert.
     * @returns {Environment} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            toredownAt,
            createdAt,
            updatedAt,
            status,
            statusMessage,
            runs,
        } = databaseObject;

        const minifiedRuns = (runs || []).map(this.runAdapter.toMinifiedEntity);

        return {
            id,
            toredownAt: new Date(toredownAt).getTime(),
            status: status,
            statusMessage: statusMessage,
            runs: minifiedRuns,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };
    }

    /**
     * Converts the given entity object to a database object
     *
     * @param {Partial<Environment>} entityObject Object to convert.
     * @returns {Partial<SequelizeEnvironment>} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            id: entityObject.id,
            status: entityObject.status,
            toredownAt: entityObject.toredownAt,
            statusMessage: entityObject.statusMessage,
        };
    }
}

module.exports = EnvironmentAdapter;
