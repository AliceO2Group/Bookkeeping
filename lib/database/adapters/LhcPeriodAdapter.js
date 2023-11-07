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
 * LhcPeriodAdapter
 */
class LhcPeriodAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.lhcPeriodStatisticsAdapter = null;

        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeLhcPeriod} databaseObject Object to convert.
     * @returns {LhcPeriod} Converted entity object.
     */
    toEntity({ id, name, lhcPeriodStatistics }) {
        const lhcPeriod = {
            id,
            name,
        };
        lhcPeriod.lhcPeriodStatistics = lhcPeriodStatistics ?
            this.lhcPeriodStatisticsAdapter.toEntity(lhcPeriodStatistics)
            : null;

        return lhcPeriod;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {LhcPeriod} entityObject Object to convert.
     * @returns {SequelizeLhcPeriod} Converted database object.
     */
    toDatabase({ id, name }) {
        return {
            id,
            name,
        };
    }
}

module.exports = LhcPeriodAdapter;
