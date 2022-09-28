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

const { getEnvironment } = require('./getEnvironment.js');
const { EnvironmentAdapter } = require('../../../database/adapters/index.js');
const { createEnvironment } = require('./createEnvironment.js');
const { updateEnvironment } = require('./updateEnvironment.js');

/**
 * Global service to handle environment instances
 */
class EnvironmentService {
    /**
     * Find and return an environment by its id
     *
     * @param {string} environmentId the id of the environment to find
     * @return {Promise<Environment|null>} resolve with the environment found or null
     */
    async get(environmentId) {
        const environment = await getEnvironment(environmentId, (queryBuilder) => {
            queryBuilder.include('runs');
        });

        return environment ? EnvironmentAdapter.toEntity(environment) : null;
    }

    /**
     * Create an environment in the database and return the created instance
     *
     * @param {Partial<Environment>} newEnvironment the environment to create
     * @return {Promise<Environment>} resolve with the created environment instance
     */
    async create(newEnvironment) {
        const environmentId = await createEnvironment(EnvironmentAdapter.toDatabase(newEnvironment));
        return this.get(environmentId);
    }

    /**
     * Update the given environment
     *
     * @param {string} environmentId the identifier of the environment to update
     * @param {Partial<Environment>} environmentPatch the patch to apply on the environment
     * @return {Promise<Environment>} resolve with the resulting environment
     */
    async update(environmentId, environmentPatch) {
        await updateEnvironment(environmentId, EnvironmentAdapter.toDatabase(environmentPatch));
        return this.get(environmentId);
    }
}

exports.EnvironmentService = EnvironmentService;

exports.environmentService = new EnvironmentService();
