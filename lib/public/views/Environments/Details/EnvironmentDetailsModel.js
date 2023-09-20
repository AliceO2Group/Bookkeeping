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

import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { TabbedPanelModel } from '../../../components/TabbedPanel/TabbedPanelModel.js';

export const ENVIRONMENT_DETAILS_PANELS_KEYS = {
    RUNS: 'runs',
    LOGS: 'logs',
};

/**
 * Model to store the state of environment details page
 */
export class EnvironmentDetailsModel extends Observable {
    /**
     * Constructor
     * @param {string} [environmentId=null] the id of the environment to display
     */
    constructor(environmentId = null) {
        super();
        this.environmentId = environmentId;

        this._tabbedPanelModel = new EnvironmentDetailTabbedPanelModel();
        this._tabbedPanelModel.bubbleTo(this);
    }

    /**
     * Define the environment to display by its id
     *
     * @param {string} environmentId the id of the environment
     */
    set environmentId(environmentId) {
        if (environmentId === null) {
            this._environment = RemoteData.notAsked();
        } else {
            if (this._environment.isSuccess() && this._environment.payload.id === environmentId) {
                return;
            }

            this._fetchEnvironment(environmentId);
        }
    }

    /**
     * Retrieve a specified environment from the API
     *
     * @param {string} environmentId The id of the environment to fetch
     * @returns {void}
     */
    async _fetchEnvironment(environmentId) {
        this._environment = RemoteData.loading();
        this.notify();

        try {
            const { data: environment } = await getRemoteData(`/api/environments/${environmentId}`);

            this._environment = RemoteData.success(environment);
            this._tabbedPanelModel.environment = environment;
        } catch (error) {
            this._environment = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Returns the current environment
     *
     * @return {RemoteData} the current environment
     */
    get environment() {
        return this._environment;
    }

    /**
     * Returns the model for the tabbed component at the bottom of the page
     * @return {EnvironmentDetailTabbedPanelModel} the tabbed component model
     */
    get tabbedPanelModel() {
        return this._tabbedPanelModel;
    }
}

/**
 * Submodel for environment details tabs
 */
class EnvironmentDetailTabbedPanelModel extends TabbedPanelModel {
    /**
     * Const
     */
    constructor() {
        super(Object.values(ENVIRONMENT_DETAILS_PANELS_KEYS));
    }

    /**
     * Set the current environment
     *
     * @param {Environment} environment the current environment
     */
    set environment(environment) {
        this._environmentId = environment.id;
        this._fetchCurrentPanelData();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _fetchCurrentPanelData() {
        // Transform to switch if adding more tabs
        if (this.currentPanelKey === ENVIRONMENT_DETAILS_PANELS_KEYS.LOGS) {
            this._fetchLogsPanelData();
        }
    }

    /**
     * Fetch all the logs of the current environment
     *
     * @return {void} resolves once the logs has been fetched
     * @private
     */
    async _fetchLogsPanelData() {
        this.currentPanelData = RemoteData.loading();
        this.notify();

        try {
            const { data: logsOfEnvironment } = await getRemoteData(`/api/environments/${this._environmentId}/logs`);
            this.currentPanelData = RemoteData.success(logsOfEnvironment);
        } catch (error) {
            this.currentPanelData = RemoteData.failure(error);
        }

        this.notify();
    }
}
