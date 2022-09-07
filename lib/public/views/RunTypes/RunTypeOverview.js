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

import { fetchClient, Observable, RemoteData } from '/js/src/index.js';

/**
 * Model representing handler for the run types
 */
export default class RunTypeOverview extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._runTypes = RemoteData.notAsked();
    }

    /**
     * Fetch all the relevant LHC fills from the API
     *
     * @return {Promise<void>} void
     */
    async fetchRunTypes() {
        this._runTypes = RemoteData.loading();
        this.notify();

        const endpoint = '/api/runTypes';
        const response = await fetchClient(endpoint, { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this._runTypes = RemoteData.success(result.data);
        } else {
            this._runTypes = RemoteData.failure(result.errors || [
                {
                    title: result.error,
                    detail: result.message,
                },
            ]);
        }
        this.notify();
    }

    /**
     * Remote data representing all the relevant fills fetched from the API
     *
     * @returns {RemoteData[]} the remote data of LHC fills
     */
    get runTypes() {
        return this._runTypes;
    }
}
