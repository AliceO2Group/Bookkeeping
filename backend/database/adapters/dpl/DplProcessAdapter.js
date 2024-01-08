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
 * DplProcessAdapter
 */
class DplProcessAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {DplProcessTypeAdapter|null}
         */
        this.dplProcessTypeAdapter = null;

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
     * @param {SequelizeDplProcess} databaseObject Object to convert.
     * @returns {DplProcess} Converted entity object.
     */
    toEntity({ id, name, typeId, createdAt, updatedAt, type, processesExecutions }) {
        return {
            id,
            name,
            typeId,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
            type: type ? this.dplProcessTypeAdapter.toEntity(type) : null,
            processesExecutions: (processesExecutions ?? []).map(this.dplProcessExecutionAdapter.toEntity),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {DplProcess} entityObject Object to convert.
     * @returns {Promise<SequelizeDplProcess>} Promise with the converted database object.
     */
    toDatabase({ id, name, typeId, type, processesExecutions }) {
        return {
            id,
            name,
            typeId,
            type: type ? this.dplProcessTypeAdapter.toDatabase(type) : null,
            processesExecutions: processesExecutions.map(this.dplProcessExecutionAdapter.toDatabase),
        };
    }
}

exports.DplProcessAdapter = DplProcessAdapter;
