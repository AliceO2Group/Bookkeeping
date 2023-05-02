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
 * DplProcessExecutionAdapter
 */
class DplProcessExecutionAdapter {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {DplDetectorAdapter|null}
         */
        this.dplDetectorAdapter = null;

        /**
         * @type {HostAdapter|null}
         */
        this.hostAdapter = null;

        /**
         * @type {DplProcessAdapter|null}
         */
        this.dplProcessAdapter = null;

        /**
         * @type {RunAdapter|null}
         */
        this.runAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeDplProcessExecution} databaseObject Object to convert.
     * @returns {DplProcessExecution} Converted entity object.
     */
    toEntity(databaseObject) {
        const { id, hostId, processId, detectorId, runNumber, createdAt, updatedAt, detector, host, process, run } = databaseObject;

        return {
            id,
            hostId,
            processId,
            detectorId,
            runNumber,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
            detector: detector ? this.dplDetectorAdapter.toEntity(detector) : null,
            host: host ? this.hostAdapter.toEntity(host) : null,
            process: process ? this.dplProcessAdapter.toEntity(process) : null,
            run: run ? this.runAdapter.toEntity(run) : null,
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {DplProcessExecution} entityObject Object to convert.
     * @returns {Promise<SequelizeDplProcessExecution>} Promise with the converted database object.
     */
    toDatabase(entityObject) {
        const { id, hostId, processId, detectorId, runNumber, detector, host, process, run } = entityObject;

        return {
            id,
            hostId,
            processId,
            detectorId,
            runNumber,
            detector: detector ? this.dplDetectorAdapter.toDatabase(detector) : null,
            host: host ? this.hostAdapter.toDatabase(host) : null,
            process: process ? this.dplProcessAdapter.toDatabase(process) : null,
            run: run ? this.runAdapter.toDatabase(run) : null,
        };
    }
}

exports.DplProcessExecutionAdapter = DplProcessExecutionAdapter;
