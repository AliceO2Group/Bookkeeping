/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

/**
 * DetectorAdapter
 */
class DetectorAdapter {
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
     * @param {SequelizeDetector} databaseObject Object to convert.
     * @returns {Detector} Converted entity object.
     */
    toEntity(databaseObject) {
        const { id, name, isPhysical, createdAt, updatedAt, processesExecutions } = databaseObject;
        return {
            id,
            name,
            isPhysical,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
            processesExecutions: (processesExecutions ?? []).map(this.dplProcessExecutionAdapter.toEntity),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Detector} entityObject Object to convert.
     * @returns {Promise<SequelizeDetector>} Promise with the converted database object.
     */
    toDatabase(entityObject) {
        const { id, name, processesExecutions } = entityObject;
        return {
            id,
            name,
            processesExecutions: processesExecutions.map(this.dplProcessExecutionAdapter.toDatabase),
        };
    }

    /**
     * Converts the given database object to a minified entity object.
     *
     * @param {SequelizeQcFlagType} databaseObject Object to convert.
     * @returns {Partial<Detector>} Converted entity object.
     */
    toMinifiedEntity(databaseObject) {
        const {
            id,
            name,
        } = databaseObject;

        return {
            id,
            name,
        };
    }
}

exports.DetectorAdapter = DetectorAdapter;
