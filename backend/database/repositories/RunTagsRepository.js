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
        RunTags,
    },
} = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the RunTagsRepository.
 */
class RunTagsRepository extends Repository {
    /**
     * Creates a new `RunTagsRepository` instance.
     */
    constructor() {
        super(RunTags);
    }

    /**
     * Remove all tags & runs relations by run id
     * @param {number} runId  - run ID to delete tags for
     * @return {Promise<void>} - delete result
     */
    async removeById(runId) {
        return RunTags.sequelize.getQueryInterface().bulkDelete('run_tags', { run_id: runId });
    }

    /**
     * Update run tags by runNumber
     * @param {Array} entities - Tags & runId to associate
     * @return {*} Result of updating
     */
    async insertMany(entities) {
        return RunTags.bulkCreate(entities, { returning: true });
    }
}

module.exports = new RunTagsRepository();
