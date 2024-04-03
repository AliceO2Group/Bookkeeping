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
 * QualityControlFlagAdapter
 */
class QcFlagAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);

        this.qcFlagTypeAdapter = null;
        this.userAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeQualityControlFlag} databaseObject Object to convert.
     * @returns {QcFlag} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            from,
            to,
            comment,
            createdAt,
            runNumber,
            dplDetectorId,
            createdById,
            user,
            flagTypeId,
            flagType,
        } = databaseObject;

        return {
            id,
            from: from ? new Date(from).getTime() : null,
            to: to ? new Date(to).getTime() : null,
            comment: comment ?? null,
            runNumber,
            dplDetectorId,
            user: user ? this.userAdapter.toEntity(user) : null,
            flagTypeId,
            flagType: flagType ? this.qcFlagTypeAdapter.toEntity(flagType) : null,
            createdById,
            createdAt: createdAt ? new Date(createdAt).getTime() : null,
        };
    }
}

module.exports = { QcFlagAdapter };
