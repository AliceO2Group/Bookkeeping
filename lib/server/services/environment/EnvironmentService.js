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
const { createEnvironment } = require('./createEnvironment.js');
const { updateEnvironment } = require('./updateEnvironment.js');
const { environmentAdapter, environmentHistoryItemAdapter } = require('../../../database/adapters/index.js');
const { utilities: { TransactionHelper } } = require('../../../database');
const { createEnvironmentHistoryItem } = require('../environmentHistoryItem/createEnvironmentHistoryItem.js');
const { isAnEmptyShell } = require('../../utilities/isAnEmptyShell.js');

/**
 * @typedef EnvironmentState the state of an environment at a given point
 * @property {string} status
 * @property {string|null} statusMessage
 */

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
            queryBuilder.include('historyItems');
        });

        return environment ? environmentAdapter.toEntity(environment) : null;
    }

    /**
     * Create an environment in the database and return the created instance
     *
     * @param {Partial<Environment>} newEnvironment the environment to create
     * @param {EnvironmentState} [currentState] the current state of the environment
     * @return {Promise<Environment>} resolve with the created environment instance
     */
    async create(newEnvironment, currentState) {
        const environmentId = await TransactionHelper.provide(async () => {
            const environmentId = await createEnvironment(environmentAdapter.toDatabase(newEnvironment));

            if (!isAnEmptyShell(currentState)) {
                await createEnvironmentHistoryItem(environmentHistoryItemAdapter.toDatabase({ ...currentState, environmentId }));
            }

            return environmentId;
        });
        return this.get(environmentId);
    }

    /**
     * Update the given environment
     *
     * @param {string} environmentId the identifier of the environment to update
     * @param {Partial<Environment>} environmentPatch the patch to apply on the environment
     * @param {EnvironmentState} [newState] optionally the new state of the environment
     * @return {Promise<Environment>} resolve with the resulting environment
     */
    async update(environmentId, environmentPatch, newState) {
        await TransactionHelper.provide(async () => {
            await updateEnvironment(environmentId, environmentAdapter.toDatabase(environmentPatch));
            if (!isAnEmptyShell(newState)) {
                await createEnvironmentHistoryItem(environmentHistoryItemAdapter.toDatabase({ ...newState, environmentId }));
            }
        });
        return this.get(environmentId);
    }
}

exports.EnvironmentService = EnvironmentService;

exports.environmentService = new EnvironmentService();
