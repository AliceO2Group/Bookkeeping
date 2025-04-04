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
        this.qcFlagVerificationAdapter = null;
        this.qcFlagEffectivePeriodAdapter = null;
        this.userAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeQcFlag} databaseObject Object to convert.
     * @returns {QcFlag} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            deleted,
            from,
            to,
            comment,
            origin,
            createdAt,
            updatedAt,
            runNumber,
            detectorId,
            createdById,
            createdBy,
            flagTypeId,
            flagType,
            verifications,
            effectivePeriods,
        } = databaseObject;

        return {
            id,
            deleted,
            from: from ? new Date(from).getTime() : null,
            to: to ? new Date(to).getTime() : null,
            comment: comment ?? null,
            origin,
            runNumber,
            dplDetectorId: detectorId,
            flagTypeId,
            flagType: flagType ? this.qcFlagTypeAdapter.toMinifiedEntity(flagType) : null,
            createdById,
            createdBy: createdBy ? this.userAdapter.toEntity(createdBy) : null,
            createdAt: createdAt ? new Date(createdAt).getTime() : null,
            updatedAt: createdAt ? new Date(updatedAt).getTime() : null,
            verifications: (verifications ?? []).map(this.qcFlagVerificationAdapter.toEntity),
            effectivePeriods: (effectivePeriods ?? []).map(this.qcFlagEffectivePeriodAdapter.toEntity),
        };
    }
}

module.exports = { QcFlagAdapter };
