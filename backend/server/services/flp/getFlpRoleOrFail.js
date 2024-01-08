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

const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getFlpRole } = require('./getFlpRole.js');

/**
 * Find an FLP role model by its identifier and reject with a NotFoundError if none is found
 *
 * @param {FlpRoleIdentifier} identifier the identifier of the FLP role to find
 * @return {Promise<SequelizeFlpRole>} resolve with the FLP role model found or reject with a NotFoundError
 */
exports.getFlpRoleOrFail = async (identifier) => {
    const flpRoleModel = await getFlpRole(identifier);
    if (flpRoleModel !== null) {
        return flpRoleModel;
    } else {
        const criteriaExpression = identifier.flpRoleId
            ? `id (${identifier.flpRoleId})`
            : `name (${identifier.flpName}) and run number (${identifier.runNumber})`;
        throw new NotFoundError(`FLP with this ${criteriaExpression} could not be found`);
    }
};
