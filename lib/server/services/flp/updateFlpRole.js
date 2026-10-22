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

const { getFlpRoleOrFail } = require('./getFlpRoleOrFail.js');
const { FlpRoleRepository } = require('../../../database/repositories/index.js');

/**
 * Updates a given FLP role
 *
 * @param {FlpRoleIdentifier} identifier the identifier of the FLP role to update
 * @param {SequelizeFlpRole} patch the patch to apply
 * @return {Promise<SequelizeFlpRole>} the updated FLP role
 */
exports.updateFlpRole = async (identifier, patch) => {
    const flpRole = await getFlpRoleOrFail(identifier);
    await FlpRoleRepository.update(flpRole, patch);
    return flpRole;
};
