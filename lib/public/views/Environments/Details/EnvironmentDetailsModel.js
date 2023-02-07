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
}
