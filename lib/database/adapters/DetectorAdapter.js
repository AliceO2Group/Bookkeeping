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
 * Adapter for Detector
 */
class DetectorAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeDetector} databaseObject Object to convert.
     * @returns {Detector} Converted entity object.
     */
    toEntity({ id, name, type, createdAt, updatedAt }) {
        return {
            id,
            name,
            type,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Detector>} entityObject Object to convert.
     * @returns {Partial<SequelizeDetector>} Converted database object.
     */
    toDatabase({ name, type }) {
        return { name, type };
    }
}

module.exports = DetectorAdapter;
