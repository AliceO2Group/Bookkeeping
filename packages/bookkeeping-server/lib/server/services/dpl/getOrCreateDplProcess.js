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
 * Fetch (and create if it does not exist) a DPL process by its name and type id
 *
 * Be careful! This does not check beforehand if a DPL process type exists with the given id
 *
 * @param {string} name the name of the dpl process to find/create
 * @param {number} typeId the id of the type of the dpl process to find/create
 * @return {Promise<SequelizeDplProcess>} the dpl process found
 */
exports.getOrCreateDplProcessByNameAndTypeId = async (name, typeId) => DplProcessRepository.findOneOrCreate({ name, typeId });
