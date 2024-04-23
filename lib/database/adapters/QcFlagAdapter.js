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
            updatedAt,
            runNumber,
            dplDetectorId,
            createdById,
            createdBy,
            flagTypeId,
            flagType,
            verifications,
            ineffectivenessPeriods,
        } = databaseObject;

        const sumOfIneffectivenessPeriods = ineffectivenessPeriods?.reduce((acc, { from, to }) => acc + (to - from), 0);
        const effectivePart = 1 - sumOfIneffectivenessPeriods / (to - from);

        return {
            id,
            from: from ? new Date(from).getTime() : null,
            to: to ? new Date(to).getTime() : null,
            effectivePart,
            comment: comment ?? null,
            runNumber,
            dplDetectorId,
            flagTypeId,
            flagType: flagType ? this.qcFlagTypeAdapter.toMinifiedEntity(flagType) : null,
            createdById,
            createdBy: createdBy ? this.userAdapter.toEntity(createdBy) : null,
            createdAt: createdAt ? new Date(createdAt).getTime() : null,
            updatedAt: createdAt ? new Date(updatedAt).getTime() : null,
            verifications: (verifications ?? []).map(this.qcFlagVerificationAdapter.toEntity),
            ineffectivenessPeriods: (ineffectivenessPeriods ?? []).map(({ from, to }) => ({
                from: new Date(from).getTime(),
                to: new Date(to).getTime(),
            })),
        };
    }
}

module.exports = { QcFlagAdapter };
