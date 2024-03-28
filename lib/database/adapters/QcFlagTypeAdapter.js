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
 * QcFlagTypeAdapter
 */
class QcFlagTypeAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.userAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeQcFlagType} databaseObject Object to convert.
     * @returns {QcFlagType} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            name,
            method,
            bad,
            color,

            createdBy,
            createdById,
            createdAt,

            lastUpdatedBy,
            lastUpdatedById,
            updatedAt,

            archived,
            archivedAt,
        } = databaseObject;

        return {
            id,
            name,
            method,
            bad,
            color,

            createdBy: createdBy ? this.userAdapter.toEntity(createdBy) : null,
            createdById,
            createdAt: createdAt ? new Date(createdAt).getTime() : null,

            lastUpdatedBy: lastUpdatedBy ? this.userAdapter.toEntity(lastUpdatedBy) : null,
            lastUpdatedById,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : null,

            archived,
            archivedAt: archivedAt ? new Date(archivedAt).getTime() : null,
        };
    }
}

module.exports = { QcFlagTypeAdapter };
