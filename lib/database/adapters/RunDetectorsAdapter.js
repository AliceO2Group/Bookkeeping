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
 * RunDetectorsAdapter
 */
class RunDetectorsAdapter {
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
     * @param {object} databaseObject Object to convert.
     * @param {number} databaseObject.runNumber runNumber of the run to convert.
     * @param {number} databaseObject.detectorId id of the detector to convert.
     * @param {string} databaseObject.quality quality to convert.
     * @returns {object} Converted entity object.
     */
    toEntity({ runNumber, detectorId, quality }) {
        return { runNumber, detectorId, quality };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {object} entityObject Object to convert.
     * @returns {object} Converted database object.
     */
    toDatabase(entityObject) {
        return {
            runNumber: entityObject.runNumber,
            detectorId: entityObject.detectorId,
            quality: entityObject.quality,
        };
    }
}

module.exports = RunDetectorsAdapter;
