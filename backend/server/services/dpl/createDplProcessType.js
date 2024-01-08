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

const { DplProcessTypeRepository } = require('../../../database/repositories/index.js');

/**
 * Create a new DPL process type, without prior check for duplication
 *
 * @param {Partial<SequelizeDplProcessType>} dplProcessType the DPL process type to create
 * @return {Promise<number>} the id of the generated DPL process type
 */
exports.createDplProcessType = async (dplProcessType) => {
    const { /** @type {number} id */ id } = await DplProcessTypeRepository.insert(dplProcessType);
    return id;
};
