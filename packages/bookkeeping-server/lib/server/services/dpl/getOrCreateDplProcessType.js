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
 * Fetch (and create if it does not exist) a DPL process type
 *
 * @param {string} label the label of the dpl process type to find/create
 * @return {Promise<SequelizeDplProcessType>} the dpl process type found
 */
exports.getOrCreateDplProcessTypeByLabel = async (label) => DplProcessTypeRepository.findOneOrCreate({ label });
