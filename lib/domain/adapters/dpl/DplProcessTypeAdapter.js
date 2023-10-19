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
 * DplProcessTypeAdapter
 */
class DplProcessTypeAdapter {
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
     * @param {SequelizeDplProcessType} databaseObject Object to convert.
     * @returns {DplProcessType} Converted entity object.
     */
    toEntity({ id, label, createdAt, updatedAt }) {
        return {
            id,
            label,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {DplProcessType} entityObject Object to convert.
     * @returns {SequelizeDplProcessType} Promise with the converted database object.
     */
    toDatabase({ id, label }) {
        return { id, label };
    }
}

exports.DplProcessTypeAdapter = DplProcessTypeAdapter;
