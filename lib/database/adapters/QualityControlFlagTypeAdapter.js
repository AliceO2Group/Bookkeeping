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
 * QualityControlFlagTypeAdapter
 */
class QualityControlFlagTypeAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeQualityControlFlagType} databaseObject Object to convert.
     * @returns {QualityControlFlagType} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            name,
            method,
            bad,
            obsolate,
        } = databaseObject;

        return {
            id,
            name,
            method,
            bad,
            obsolate,
        };
    }
}

module.exports = { QualityControlFlagTypeAdapter };
