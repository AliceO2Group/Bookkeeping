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
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;
        this.appInfo = RemoteData.NotAsked();
    }

    async fetchAppInfo() {
        this.setAppInfo(RemoteData.loading());
        try {
            const {data: appInfo} = await getRemoteData('/api/status/gui/');
            appInfo
            this.setAppInfo(RemoteData.success(appInfo));
        } catch (error) {
            this.setAppInfo(RemoteData.failure(error));
        }
        this.notify();
    }

    setAppInfo(appInfo) {
        this.appInfo = appInfo;
        this.notify();
    }
    
    getAppInfo() {
        return this.appInfo;
    }
}
