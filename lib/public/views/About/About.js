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
export default class AboutModel extends Observable {
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
        this._dbInfo = await this.fetchServiceInfo('/api/status/database');
        this._appInfo = await this.fetchServiceInfo('/api/status/gui');
        this.notify();
    }

    /**
     * Fetches information about the service determined by the api path
     * @param {string} apiPath the path to the endpoint for this service's status
     * @returns {Object} an object which contains the version (if the request was successful)
     *                   and the status of the service
     */
    async fetchServiceInfo(apiPath) {
        let service = RemoteData.loading();
        try {
            const { data: info } = await getRemoteData(apiPath);
            service = RemoteData.success({
                version: info.version,
                status: info.status,
            });
        } catch {
            service = RemoteData.failure({ status: { ok: false } });
        }
        return service;
    }

    /**
     * Set the app info and notify
     * @param {RemoteData} appInfo information about the app
     * @returns {void}
     */
    set appInfo(appInfo) {
        this._appInfo = appInfo;
        this.notify();
    }

    /**
     * Get the app info
     * @returns {RemoteData} information about the app service
     */
    get appInfo() {
        return this._appInfo;
    }

    /**
     * Set the database info and notify
     * @param {RemoteData} dbInfo information about the database
     * @returns {void}
     */
    set dbInfo(dbInfo) {
        this._dbInfo = dbInfo;
        this.notify();
    }

    /**
     * Get the database info
     * @returns {RemoteData} information about the database service
     */
    get dbInfo() {
        return this._dbInfo;
    }
}
