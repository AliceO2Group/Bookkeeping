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
 * QcFlagIneffectivenessPeriodAdapter
 */
class QcFlagIneffectivenessPeriodAdapter {
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
     * @param {SequelizeQcFlagIneffectivenessPeriod} databaseObject Object to convert.
     * @returns {QcFlagIneffectivenessPeriod} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            from,
            to,
        } = databaseObject;

        return {
            from: from ? new Date(from).getTime() : null,
            to: to ? new Date(to).getTime() : null,
        };
    }
}

module.exports = { QcFlagIneffectivenessPeriodAdapter };
