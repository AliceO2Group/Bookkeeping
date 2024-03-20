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
 * DplDetectorAdapter
 */
class DplDetectorAdapter {
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
     * @param {SequelizeDplDetector} databaseObject Object to convert.
     * @returns {DplDetector} Converted entity object.
     */
    toEntity(databaseObject) {
        const { id, name, createdAt, updatedAt, processesExecutions } = databaseObject;
        return {
            id,
            name,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
            processesExecutions: (processesExecutions ?? []).map(this.dplProcessExecutionAdapter.toEntity),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {DplDetector} entityObject Object to convert.
     * @returns {Promise<SequelizeDplDetector>} Promise with the converted database object.
     */
    toDatabase(entityObject) {
        const { id, name, processesExecutions } = entityObject;
        return {
            id,
            name,
            processesExecutions: processesExecutions.map(this.dplProcessExecutionAdapter.toDatabase),
        };
    }
}

exports.DplDetectorAdapter = DplDetectorAdapter;
