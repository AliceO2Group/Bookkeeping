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
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

/**
 * Service class to fetch detectors
 */
export class DetectorsProvider extends Observable {
    /**
     * Constructor
     * @param {DetectorsProvider} parentInstance paranet instance
     * through which child-instances can share successfuly fetched detectors data therby reducing number of requests.
     */
    constructor(parentInstance = null) {
        super();
        this._parentInstance = parentInstance;
        this._detectors = RemoteData.notAsked();
    }

    /**
     * Fetch available detectors
     * @return {Promise<RemoteData<Detector[]>>} the list of all detectors
     */
    async fetch() {
        try {
            if (!this._detectors.isSuccess()) {
                if (this._parentInstance.detectors.isSuccess()) {
                    this._detectors = this._parentInstance.detectors;
                } else {
                    this._detectors = RemoteData.loading();
                    this.notify();
                    const { data } = await getRemoteData('/api/detectors');
                    this._detectors = RemoteData.success(data);
                    this._parentInstance._detectors = this._detectors;
                }
            }
        } catch (errors) {
            this._detectors = RemoteData.failure(errors);
        }
        this.notify();
        return this._detectors;
    }

    /**
     * Get all detectors
     * @return {RemoteData<{id: number, name: string}[]>} detectors
     */
    get detectors() {
        return this._detectors ;
    }
}

const parentInstance = new DetectorsProvider();

export const DetectorsProviderWrp = {

    /**
     * Create new instance
     * @return {DetectorsProvider} new instance
     */
    getInstance() {
        return new DetectorsProvider(parentInstance);
    },
};
