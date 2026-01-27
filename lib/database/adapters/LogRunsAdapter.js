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
 * LogRunsAdapter
 */
class LogRunsAdapter {
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
     * @param {number} databaseObject.logId id of the log to convert.
     * @param {number} databaseObject.runId id of the run to convert.
     * @returns {object} Converted entity object.
     */
    toEntity({ logId, runId }) {
        return { logId, runId };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {object} entityObject Object to convert.
     * @returns {Promise<object>} Promise with the converted database object.
     */
    toDatabase(entityObject) {
        return entityObject;
    }
}

module.exports = LogRunsAdapter;
