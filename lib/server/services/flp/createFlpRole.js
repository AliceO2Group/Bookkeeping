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

const { getFlpRole } = require('./getFlpRole.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const FlpRoleRepository = require('../../../database/repositories/FlpRoleRepository.js');
const { getRunOrFail } = require('../run/getRunOrFail.js');

/**
 * Create an FLP role in the database and return the auto generated id
 *
 * @param {Partial<SequelizeFlpRole>} flpRole the FLP role to create
 * @param {number} [runNumber] optionally the run number to which FLP role must be linked
 * @return {Promise<number>} resolve once the creation is done providing the id of the FLP role that have been (or will be) created
 */
exports.createFlpRole = async (flpRole) => {
    const { id: flpRoleId, runNumber } = flpRole;

    if (flpRoleId) {
        const existingFlpRole = await getFlpRole(flpRoleId);
        if (existingFlpRole) {
            throw new ConflictError(`An FLP already exists with id ${flpRoleId}`);
        }
    }

    // Check run number if it applies
    if (runNumber) {
        await getRunOrFail({ runNumber });
    }

    const { /** @type {number} id */ id: newFlpRoleId } = await FlpRoleRepository.insert(flpRole);
    return newFlpRoleId;
};
