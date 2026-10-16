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

const { tables: { LogDataPasses } } = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the LogDataPassesRepository.
 */
class LogDataPassesRepository extends Repository {
    /**
     * Creates a new `LogDataPassesRepository` instance.
     */
    constructor() {
        super(LogDataPasses);
    }

    /**
     * Bulk insert logDataPasses.
     *
     * @param {{logId: number, dataPassId: number}[]} entities the links to insert
     * @returns {Promise} Promise object represents the recently inserted LogDataPasses.
     */
    async bulkInsert(entities) {
        return LogDataPasses.bulkCreate(entities, { returning: true });
    }
}

module.exports = new LogDataPassesRepository();
