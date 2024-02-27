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
class QualityControlFlagAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);

        this.qualityControlFlagTypeAdapter = null;
        this.qualityControlFlagVerificationAdapter = null;
        this.userAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeQualityControlFlag} databaseObject Object to convert.
     * @returns {QualityControlFlag} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            timeStart,
            timeEnd,
            comment,
            provenance,
            createdAt,
            dataPassId,
            runNumber,
            detectorId,
            userId,
            user,
            flagTypeId,
            flagType,
            verifications,
        } = databaseObject;

        return {
            id,
            timeStart: timeStart ? new Date(timeStart).getTime() : null,
            timeEnd: timeEnd ? new Date(timeEnd).getTime() : null,
            comment: comment ?? null,
            provenance,
            createdAt: createdAt ? new Date(createdAt).getTime() : null,
            dataPassId,
            runNumber,
            detectorId,
            userId,
            user: user ? this.userAdapter.toEntity(user) : null,
            flagTypeId,
            flagType: flagType ? this.qualityControlFlagTypeAdapter.toEntity(flagType) : null,
            verifications: verifications?.map(this.qualityControlFlagVerificationAdapter.toEntity) ?? null,
        };
    }
}

module.exports = { QualityControlFlagAdapter };
