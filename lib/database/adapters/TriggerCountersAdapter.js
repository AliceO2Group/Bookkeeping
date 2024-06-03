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
 * TriggerCountersAdapter
 */
class TriggerCountersAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeTriggerCounters} databaseObject Object to convert.
     * @returns {TriggerCounters} Converted entity object.
     */
    toEntity({ id, timestamp, runNumber, className, lmb, lma, l0b, l0a, l1b, l1a, createdAt, updatedAt }) {
        return {
            id,
            timestamp: timestamp ? new Date(timestamp).getTime() : createdAt,
            runNumber,
            className,
            lmb,
            lma,
            l0b,
            l0a,
            l1b,
            l1a,
            createdAt: createdAt ? new Date(createdAt).getTime() : createdAt,
            updatedAt: updatedAt ? new Date(updatedAt).getTime() : updatedAt,
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {TriggerCounters} entityObject Entity to convert
     * @returns {Partial<SequelizeTriggerCounters>} Sequelize object
     */
    toDatabase({ id, timestamp, runNumber, className, lmb, lma, l0b, l0a, l1b, l1a }) {
        return {
            id,
            timestamp,
            runNumber,
            className,
            lmb,
            lma,
            l0b,
            l0a,
            l1b,
            l1a,
        };
    }
}

exports.TriggerCountersAdapter = TriggerCountersAdapter;
