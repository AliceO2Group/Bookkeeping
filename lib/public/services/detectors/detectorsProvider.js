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
 * Service class to fetch detectors from the backend
 */
export class DetectorsProvider extends Observable {
    /**
     * Constructor
     * @param {DetectorsProvider} sinkInstance instance to execute rule... TODO
     */
    constructor(sinkInstance = undefined) {
        super();
        this._sinkInstance = sinkInstance;
        this._detectors = RemoteData.notAsked();
    }

    /**
     * Returns the list of all the available detectors
     *
     * @return {Promise<Detector[]>} the list of all detectors
     */
    async fetch() {
        try {
            if (!this._detectors.isSuccess()) {
                const isSinkSucess = this._sinkInstance.detectors.isSuccess();
                if (isSinkSucess) {
                    this._detectors = this._sinkInstance.detectors;
                } else {
                    this._detectors = RemoteData.loading();
                    this.notify();
                    const { data } = await getRemoteData('/api/detectors');
                    this._detectors = RemoteData.success(data);
                    this._sinkInstance._detectors = this._detectors;
                }
            }
        } catch (errors) {
            this._detectors = RemoteData.failure(errors);
        }
        this.notify();
    }

    /**
     * Get all detectors
     * @return {RemoteData<{id: number, name: string}[]>} detectors
     */
    get detectors() {
        return this._detectors ;
    }
}

const sinkInstance = new DetectorsProvider();

export const DetectorsProviderWrp = {

    /**
     * Create new instance
     * @return {DetectorsProvider} new instance
     */
    getInstance() {
        return new DetectorsProvider(sinkInstance);
    },
};
