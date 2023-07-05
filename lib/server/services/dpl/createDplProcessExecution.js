/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { DplProcessExecutionRepository } = require('../../../database/repositories/index.js');

/**
 * Create a new DPL process execution, without prior check for duplication
 *
 * @param {Partial<SequelizeDplProcessExecution>} dplProcessExecution the DPL process execution to create
 * @return {Promise<number>} the id of the generated DPL process execution
 */
exports.createDplProcessExecution = async (dplProcessExecution) => {
    const { /** @type {number} id */ id } = await DplProcessExecutionRepository.insert(dplProcessExecution);
    return id;
};
