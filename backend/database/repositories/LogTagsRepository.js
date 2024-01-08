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

const {
    tables: {
        LogTags,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the LogTagsRepository.
 */
class LogTagsRepository extends Repository {
    /**
     * Creates a new `LogTagsRepository` instance.
     */
    constructor() {
        super(LogTags);
    }

    /**
     * Bulk insert entities.
     *
     * @param {Array} entities List of entities to insert.
     * @returns {Promise} Promise object represents the recently inserted LogTags.
     */
    async bulkInsert(entities) {
        return LogTags.bulkCreate(entities, { returning: true });
    }
}

module.exports = new LogTagsRepository();
