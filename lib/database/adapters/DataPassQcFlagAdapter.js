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

const { AdapterError } = require('../../server/errors/AdapterError.js');

/**
 * Adapter for data pass QC flag
 */
class DataPassQcFlagAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);

        this.qcFlagAdapter = null;
        this.dataPassAdapter = null;
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
            dataPass,
        } = databaseObject;

        if (qcFlag === null) {
            throw new AdapterError('Related QC flag missing in DataPassQcFlag.');
        }

        return {
            ...this.qcFlagAdapter.toEntity(qcFlag),
            dataPassId,
            qcFlagId: qualityControlFlagId,
            dataPass: dataPass ? this.dataPassAdapter.toEntity(dataPass) : null,
        };
    }
}

exports.DataPassQcFlagAdapter = DataPassQcFlagAdapter;
