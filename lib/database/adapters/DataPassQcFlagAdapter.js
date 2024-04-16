/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

/**
 * Adapter for data pass QC flag
 */
class DataPassQcFlagAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);

        this.dataPassAdapter = null;
        this.qcFlagTypeAdapter = null;
        this.qcFlagVerificationAdapter = null;
        this.userAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeDataPassQcFlag} databaseObject Object to convert.
     * @returns {DataPassQcFlag} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            dataPassId,
            qualityControlFlagId,
            qcFlag,
            createdAt,
            updatedAt,
            dataPass,
        } = databaseObject;

        return {
            dataPassId,
            qcFlagId: qualityControlFlagId,
            comment: qcFlag.comment,
            createdById: qcFlag.createdById,
            flagTypeId: qcFlag.flagTypeId,
            runNumber: qcFlag.runNumber,
            dplDetectorId: qcFlag.dplDetectorId,
            createdAt,
            updatedAt,
            dataPass: dataPass ? this.dataPassAdapter.toEntity(dataPass) : null,
            createdBy: qcFlag.createdBy ? this.userAdapter.toEntity(qcFlag.createdBy) : null,
            flagType: qcFlag.flagType ? this.qcFlagTypeAdapter.toEntity(qcFlag.flagType) : null,
            verifications: qcFlag.verifications ? this.qcFlagVerificationAdapter.toEntity(qcFlag.verifications) : null,
        };
    }
}

exports.DataPassQcFlagAdapter = DataPassQcFlagAdapter;
