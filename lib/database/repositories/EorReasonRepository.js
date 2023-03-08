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
    models: {
        EorReason,
    },
} = require('./../');
const Repository = require('./Repository');
const { Op } = require('sequelize');

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
     * Remove all eor_reasons & runs relations by one runId
     * @param {Number} runId  - run ID to delete eor_reasons for
     * @return {Promise<void>} - delete result
     */
    removeByRunId(runId) {
        return EorReason.destroy({ where: { run_id: runId } });
    }

    /**
     * Remove all eor_reasons with passed run_id but which are not included in the list of entries id
     * @param {Number} runId  - run ID to delete eor_reasons for
     * @param {Array<Number>} ids  - list of ids for which entries should be kept
     * @return {Promise<void>} - delete result
     */
    removeByRunIdAndKeepIds(runId, ids) {
        return EorReason.destroy({ where: { [Op.and]: { run_id: runId, id: { [Op.notIn]: ids } } } });
    }

    /**
     * Add list of eor_reasons
     * @param {Partial<SequelizeEorReason>[]} eorReasons - Lists of end of run reasons to add
     * @return {Promise<SequelizeEorReason[]>} - List of created EOR reasons
     */
    addMany(eorReasons) {
        return EorReason.bulkCreate(eorReasons, { returning: true });
    }
}

module.exports = new EorReasonRepository();
