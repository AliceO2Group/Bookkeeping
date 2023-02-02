/**
 * Update a given FLP role
 *
 * @param {FlpRoleIdentifier} identifier the identifier of the FLP role to update
 * @param {Partial<SequelizeFlpRole>} patch the patch to apply
 * @return {Promise<SequelizeFlpRole>} the updated FLP role
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
