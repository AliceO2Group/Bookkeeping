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

const { EorReason } = require('./../models');
const Repository = require('./Repository');
const EorReasonAdapter = require('./../adapters/EorReasonAdapter');

/**
 * Sequelize implementation of the EorReasonRepository.
 */
class EorReasonRepository extends Repository {
    /**
     * Creates a new `EorReasonRepository` instance.
     */
    constructor() {
        super(EorReason);
    }

    /**
     * Remove all eor_reasons & runs relations by run id
     * @param {number} runId  - run ID to delete eor_reasons for
     * @return {Promise<void>} - delete result
     */
    async removeById(runId) {
        return await EorReason.sequelize.getQueryInterface().bulkDelete('eor_reasons', { run_id: runId });
    }

    /**
     * Add list of eor_reasons
     * @param {Array<EorReason>} entities - Lists of end of run reasons to add
     * @return {Promise<Array,Error>} Result of updating
     */
    async addMany(entities) {
        entities = entities.map(EorReasonAdapter.toDatabase);
        return await EorReason.bulkCreate(entities, { returning: true });
    }
}

module.exports = new EorReasonRepository();
