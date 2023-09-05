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

const { models: { EnvironmentHistoryItem } } = require('../');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the EnvironmentHistoryItemRepository.
 */
class EnvironmentHistoryItemRepository extends Repository {
    /**
     * Creates a new `EnvironmentsHistoryItemRepository` instance.
     */
    constructor() {
        super(EnvironmentHistoryItem);
    }

    /**
     * Insert several environment history items at once
     *
     * @param {SequelizeEnvironmentHistoryItem[]} historyItems the items to insert
     * @return {Promise<void>} resolve once the insertion has been done
     */
    async bulkInsert(historyItems) {
        return EnvironmentHistoryItem.bulkCreate(historyItems, { returning: false });
    }
}

module.exports = new EnvironmentHistoryItemRepository();
