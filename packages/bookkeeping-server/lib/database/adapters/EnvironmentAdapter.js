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

        /**
         * @type {EnvironmentHistoryItemAdapter|null}
         */
        this.environmentHistoryItemAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     * @param {SequelizeEnvironment} databaseObject Object to convert.
     * @param {boolean} minifyRuns if true, related runs will be minified
     * @returns {Environment} Converted entity object.
     */
    toEntity(databaseObject, minifyRuns = true) {
        const {
            id,
            toredownAt,
            createdAt,
            updatedAt,
            runs,
            historyItems,
        } = databaseObject;

        const minifiedRuns = (runs || []).map(minifyRuns ? this.runAdapter.toMinifiedEntity : this.runAdapter.toEntity);
        const lastHistoryItem = historyItems?.length > 0 ? historyItems[historyItems.length - 1] : null;

        return {
            id,
            toredownAt: new Date(toredownAt).getTime(),
            status: lastHistoryItem?.status,
            statusMessage: lastHistoryItem?.statusMessage,
            runs: minifiedRuns,
            historyItems: (historyItems || []).map(this.environmentHistoryItemAdapter.toEntity),
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
