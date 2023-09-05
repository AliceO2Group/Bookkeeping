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

const { DplProcessRepository } = require('../../../database/repositories/index.js');

/**
 * Create a new DPL process, without prior check for duplication
 *
 * @param {Partial<SequelizeDplProcess>} dplProcess the DPL process to create
 * @return {Promise<number>} the id of the generated DPL process
 */
exports.createDplProcess = async (dplProcess) => {
    const { /** @type {number} id */ id } = await DplProcessRepository.insert(dplProcess);
    return id;
};
