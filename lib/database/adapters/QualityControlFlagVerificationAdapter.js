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
 * QualityControlFlagVerificationAdapter
 */
class QualityControlFlagVerificationAdapter {
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
     * @param {SequelizeQualityControlFlagVerification} databaseObject Object to convert.
     * @returns {QualityControlFlagVerification} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            comment,
            userId,
            user,
            createdAt,
            qualityControlFlagId,
        } = databaseObject;

        return {
            id,
            userId,
            user: user ? this.userAdapter.toEntity(user) : null,
            comment: comment ?? null,
            createdAt: createdAt ? new Date(createdAt).getTime() : null,
            qualityControlFlagId,
        };
    }
}

module.exports = { QualityControlFlagVerificationAdapter };