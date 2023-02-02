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

const { createFlpRole } = require('./createFlpRole.js');
const { getFlpRole } = require('./getFlpRole.js');
const { flpRoleAdapter } = require('../../../database/adapters/index.js');
const { updateFlpRole } = require('./updateFlpRole.js');

/**
 * @typedef FlpRoleIdentifier object to uniquely identify an FLP role, either by its id either by the FLP's name and a runNumber
 * @property {number} [flpRoleId] the id of the FLP role
 * @property {number} [runNumber] the run number of the related run
 * @property {string} [flpName] the name of the FLP
 */

/**
 * Global service to handle FLP instances
 */
class FlpRoleService {
    /**
     * Find and return an FLP role by its id
     *
     * @param {FlpRoleIdentifier} flpRoleIdentifier the identifier of the FLP role to find
     * @param {Object} [relations] the list of related objects to fetch with the FLP role
     * @param {boolean} [relations.run] if true, related run will be fetched alongside the FLP role
     * @return {Promise<FlpRole|null>} resolve with the FLP role found or null
     */
    async get(flpRoleIdentifier, relations) {
        relations = relations || {};
        const flpRole = await getFlpRole(flpRoleIdentifier, (queryBuilder) => {
            if (relations.run) {
                queryBuilder.include('run');
            }
        });
        return flpRole ? flpRoleAdapter.toEntity(flpRole) : null;
    }

    /**
     * Create an FLP role in the database and return the created instance
     *
     * @param {Partial<FlpRole>} newFlpRole the FLP to create
     * @return {Promise<FlpRole>} resolve with the created FLP instance
     */
    async create(newFlpRole) {
        const flpRoleId = await createFlpRole(flpRoleAdapter.toDatabase(newFlpRole));
        return this.get({ flpRoleId });
    }

    /**
     * Update a given FLP role
     *
     * @param {FlpRoleIdentifier} flpRoleIdentifier identifier of the flp to update
     * @param {Partial<FlpRole>} patch the patch to apply
     * @return {Promise<FlpRole>} the updated FLP role
     */
    async update(flpRoleIdentifier, patch) {
        await updateFlpRole(flpRoleIdentifier, flpRoleAdapter.toDatabase(patch));
        return this.get(flpRoleIdentifier);
    }
}

exports.FlpRoleService = FlpRoleService;

exports.flpRoleService = new FlpRoleService();
