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
 * HostAdapter
 */
class HostAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {DplProcessExecutionAdapter|null}
         */
        this.dplProcessExecutionAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeHost} databaseObject Object to convert.
     * @returns {Host} Converted entity object.
     */
    toEntity({ id, hostname, processesExecutions, createdAt, updatedAt }) {
        return {
            id,
            hostname,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
            processesExecutions: (processesExecutions ?? []).map(this.dplProcessExecutionAdapter.toEntity),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Host} entityObject Object to convert.
     * @returns {SequelizeHost} Promise with the converted database object.
     */
    toDatabase({ id, hostname, processesExecutions }) {
        return {
            id,
            hostname,
            processesExecutions: processesExecutions.map(this.dplProcessExecutionAdapter.toDatabase),
        };
    }
}

exports.HostAdapter = HostAdapter;
