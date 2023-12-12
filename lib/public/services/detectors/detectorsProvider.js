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
            if (!this._parentInstance._detectors.isSuccess()) {
                this._parentInstance._detectors = RemoteData.loading();
                this.notify();
                const { data } = await getRemoteData('/api/detectors');
                this._parentInstance._detectors = RemoteData.success(data.sort());
            }
        } catch (errors) {
            this._parentInstance._detectors = RemoteData.failure(errors);
        }
        this.notify();
        return this._parentInstance._detectors;
    }

    /**
     * Get all detectors
     * @return {RemoteData<{id: number, name: string}[]>} detectors
     */
    get detectors() {
        return this._parentInstance._detectors;
    }
}

const parentInstance = new DetectorsProvider();

/**
 * Create detectors provider instance
 * @return {DetectorsProvider} instance
 */
export const createDetectorsProviderInstance = () => new DetectorsProvider(parentInstance);
