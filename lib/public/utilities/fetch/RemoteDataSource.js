/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from './getRemoteData.js';

/**
 * Service class providing observable data fetching process
 */
export class RemoteDataSource {
    /**
     * Constructor
     */
    constructor() {
        /**
         * @type {ObservableData<RemoteData> | null}
         * @private
         */
        this._observableData = null;
        this._abortController = null;
    }

    /**
     * Sets the observable data to which source's data should be pushed to
     *
     * @param {ObservableData} observableData the observable data to which data should be pushed
     * @return {void}
     */
    pipe(observableData) {
        console.log('Pipe');
        this._observableData = observableData;
    }

    /**
     * Fetch the given endpoint to fill current data
     *
     * @param {string} endpoint the endpoint to fetch
     * @return {Promise<void>} resolves once the data fetching has ended
     */
    async fetch(endpoint) {
        if (!this._observableData) {
            return null;
        }

        this._observableData.setCurrent(RemoteData.loading());

        const abortController = new AbortController();
        try {
            if (this._abortController) {
                this._abortController.abort();
            }
            this._abortController = abortController;
            const data = await this.getRemoteData(endpoint);
            this._observableData.setCurrent(RemoteData.success(data));
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._observableData.setCurrent(RemoteData.failure(error));
                throw error;
            }
        }
    }

    /**
     * Fetch the endpoint and return the result
     *
     * @param {string} endpoint the endpoint to fetch
     * @return {Promise<*>} the result
     */
    async getRemoteData(endpoint) {
        return getRemoteData(endpoint, { signal: this._abortController.signal });
    }
}
