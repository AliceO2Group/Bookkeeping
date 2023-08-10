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

import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';
import { Observable, RemoteData } from '/js/src/index.js';

/**
 * Model representing handlers for aboutPage.js
 */
export class AboutModel extends Observable {
    /**
     * The constructor for the About model object
     * @param {Object} model Pass the parent model to access the defined functions
     * @returns {Object} Constructs the About model
     */
    constructor(model) {
        super();
        this.model = model;
        this._appInfo = RemoteData.NotAsked();
        this._dbInfo = RemoteData.NotAsked();
    }

    /**
     * Fetches information about the all services related to bookkeeping by querying the status api
     * @returns {void}
     */
    async fetchAllServiceInfo() {
        this._dbInfo = RemoteData.loading();
        this._appInfo = RemoteData.loading();
        this.notify();
        await Promise.all([
            (async () => {
                this._dbInfo = await this.fetchServiceInfo('/api/status/database'),
                this.notify();
            })(),
            (async () => {
                this._appInfo = await this.fetchServiceInfo('/api/status/gui'),
                this.notify();
            })(),
        ]);
    }

    /**
     * Fetches information about the service determined by the api path
     * @param {string} apiPath the path to the endpoint for this service's status
     * @returns {Object} an object which contains the version (if the request was successful)
     *                   and the status of the service
     */
    async fetchServiceInfo(apiPath) {
        try {
            const { data: { version, status } } = await getRemoteData(apiPath);
            return RemoteData.success({ version, status });
        } catch {
            return RemoteData.failure({ status: { ok: false } });
        }
    }

    /**
     * Returns an array of objects for each service containing the name and remote data for the service.
     * @returns {Object[]} An array of objects for each service containing the name and remote info
     */
    getServices() {
        return [
            { name: 'Bookkeeping', infoRemoteData: this._appInfo },
            { name: 'Database', infoRemoteData: this._dbInfo },
        ];
    }

    /**
     * Get the app info
     * @returns {RemoteData} information about the app service
     */
    get appInfo() {
        return this._appInfo;
    }

    /**
     * Get the database info
     * @returns {RemoteData} information about the database service
     */
    get dbInfo() {
        return this._dbInfo;
    }
}
