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
const { createEnvironmentHistoryItem } = require('../environmentHistoryItem/createEnvironmentHistoryItem.js');
const { isAnEmptyShell } = require('../../utilities/isAnEmptyShell.js');
const { validateAgainstSchema } = require('../../utilities/validateAgainstSchema');
const { CreateEnvironmentHistoryItemDto } = require('../../../domain/dtos/CreateEnvironmentHistoryItemDto');
const { getEnvironmentOrFail } = require('./getEnvironmentOrFail.js');
const { dataSource } = require('../../../database/DataSource.js');
const { EnvironmentHistoryItemRepository } = require('../../../database/repositories/index.js');

/**
 * @typedef EnvironmentState the state of an environment at a given point
 * @property {string} status
 * @property {string|null} statusMessage
 * @property {number} timestamp
 */

/**
 * @typedef EnvironmentRelationsToInclude object specifying which environment relations should be fetched alongside the environment
 * @property {boolean} [historyItems] if true, related history items will be fetched alongside the environment
 * @property {boolean|{relations: RunRelationsToInclude}} [runs] if true, related runs will be fetched alongside the environment. If an object
 *     is specified, the given relations will be added to the related runs
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
        const environment = await getEnvironment(environmentId, this._getEnvironmentQbConfiguration);
        return environment ? environmentAdapter.toEntity(environment, false) : null;
    }

    /**
     * Find and return an environment by its id
     *
     * @param {string} environmentId the id of the environment to find
     * @return {Promise<Environment>} resolve with the environment found or null
     * @throws {NotFound}
     */
    async getOrFail(environmentId) {
        const environment = await getEnvironmentOrFail(environmentId, this._getEnvironmentQbConfiguration);
        return environment ? environmentAdapter.toEntity(environment, false) : null;
    }

    /**
     * Create an environment in the database with its first history item if current state is provided, and return the created instance
     *
     * @param {Partial<Environment>} newEnvironment the environment to create
     * @param {EnvironmentState} [currentState] the current state of the environment
     * @return {Promise<Environment>} resolve with the created environment instance
     */
    async create(newEnvironment, currentState) {
        const environmentId = await dataSource.transaction(async () => {
            const environmentId = await createEnvironment(environmentAdapter.toDatabase(newEnvironment));

            if (!isAnEmptyShell(currentState)) {
                await validateAgainstSchema(CreateEnvironmentHistoryItemDto, currentState);
                await createEnvironmentHistoryItem(environmentHistoryItemAdapter.toDatabase({
                    status: currentState.status,
                    statusMessage: currentState.statusMessage,
                    environmentId,
                }));
            }

            return environmentId;
        });
        return this.get(environmentId);
    }

    /**
     * Update the given environment and create a new history item if the new state status is different from the current one
     *
     * @param {string} environmentId the identifier of the environment to update
     * @param {Partial<Environment>} environmentPatch the patch to apply on the environment
     * @param {EnvironmentState} [newState] optionally the new state of the environment
     * @return {Promise<Environment>} resolve with the resulting environment
     */
    async update(environmentId, environmentPatch, newState) {
        await dataSource.transaction(async () => {
            await updateEnvironment(environmentId, environmentAdapter.toDatabase(environmentPatch));
            const currentState = await EnvironmentHistoryItemRepository.findOne({
                where: { environmentId },
                order: [['createdAt', 'DESC']],
            });

            if (!isAnEmptyShell(newState) && newState.status !== currentState?.status) {
                await validateAgainstSchema(CreateEnvironmentHistoryItemDto, newState);
                await createEnvironmentHistoryItem(environmentHistoryItemAdapter.toDatabase({
                    ...newState,
                    environmentId,
                    createdAt: newState.timestamp,
                }));
            }
        });
        return this.get(environmentId);
    }

    /**
     * Define environment state at a given time
     *
     * @param {string} environmentId the id of the environment for which a new state must be registered
     * @param {EnvironmentState} state the state to save
     * @param {object<string, string>} vars updated environment vars
     * @return {Promise<void>} resolves once the state has been saved
     */
    async createOrUpdateEnvironment(environmentId, state, vars) {
        await dataSource.transaction(async () => {
            const environment = await this.get(environmentId);

            if (!environment) {
                await this.create(
                    {
                        id: environmentId,
                        createdAt: state.timestamp,
                        rawConfiguration: JSON.stringify(vars),
                    },
                    state,
                );
            } else {
                let configuration;
                if (vars) {
                    const { rawConfiguration } = environment;
                    try {
                        configuration = {
                            ...rawConfiguration ? JSON.parse(rawConfiguration) : {},
                            ...vars,
                        };
                    } catch (_) {
                        // Do nothing
                    }
                }
                await this.update(
                    environmentId,
                    {
                        updatedAt: state.timestamp,
                        rawConfiguration: JSON.stringify(configuration),
                    },
                    state,
                );
            }
        });
    }

    /**
     * Configure the given query builder for fetching an environment
     *
     * @param {QueryBuilder} queryBuilder the query builder to configure
     * @return {void}
     * @private
     */
    _getEnvironmentQbConfiguration(queryBuilder) {
        queryBuilder.include({
            association: 'runs',
            include: [
                {
                    association: 'eorReasons',
                    include: {
                        association: 'reasonType',
                        attributes: ['category', 'title'],
                    },
                },
                'runType',
            ],
        });
        queryBuilder.include('historyItems');
    }
}

exports.EnvironmentService = EnvironmentService;

exports.environmentService = new EnvironmentService();
