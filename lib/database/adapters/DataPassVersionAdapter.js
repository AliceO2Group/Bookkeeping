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
 * DataPassVersionAdapter
 */
class DataPassVersionAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.toSummary = this.toSummary.bind(this);
        this.dataPassVersionStatusAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeDataPass} databaseObject Object to convert.
     * @returns {DataPass} Converted entity object.
     */
    toEntity(databaseObject) {
        const entity = this.toSummary(databaseObject);
        const { id, dataPassId, lastSeen, statusHistory = [], createdAt, updatedAt } = databaseObject;

        entity.statusHistory = statusHistory.map(this.dataPassVersionStatusAdapter.toEntity);
        entity.id = id;
        entity.dataPassId = dataPassId;
        entity.lastSeen = lastSeen;
        entity.createdAt = createdAt ? new Date(createdAt).getTime() : null;
        entity.updatedAt = updatedAt ? new Date(updatedAt).getTime() : null;

        return entity;
    }

    /**
     * Converts the given database object to an summary object.
     *
     * @param {SequelizeDataPass} databaseObject Object to convert.
     * @returns {DataPass} Converted summary object.
     */
    toSummary(databaseObject) {
        const {
            description,
            reconstructedEventsCount,
            outputSize,
            statusHistory = [],
        } = databaseObject;

        return {
            description,
            reconstructedEventsCount,
            outputSize,
            statusHistory: statusHistory.map(this.dataPassVersionStatusAdapter.toSummary),
        };
    }
}

module.exports = { DataPassVersionAdapter };
