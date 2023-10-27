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
import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from './getRemoteData.js';

/**
 * Service class providing observable data fetching process
 */
export class RemoteDataFetcher extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._data = RemoteData.notAsked();
        this._abortController = null;
    }

    /**
     * Fetch the given endpoint to fill current data
     *
     * @template T
     * @param {string} endpoint the endpoint to fetch
     * @return {Promise<T>} resolves once the data fetching has ended
     */
    async fetch(endpoint) {
        this._data = RemoteData.loading();
        this.notify();

        const abortController = new AbortController();
        try {
            if (this._abortController) {
                this._abortController.abort();
            }
            this._abortController = abortController;
            const { data } = await getRemoteData(endpoint, { signal: this._abortController.signal });
            this._data = RemoteData.success(data);
            this.notify();
            return data;
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._data = RemoteData.failure(error);
            }
            this.notify();
            throw error;
        }
    }

    /**
     * Return the current data
     *
     * @return {RemoteData} the current remote data fetched by the fetcher
     */
    get data() {
        return this._data;
    }
}
