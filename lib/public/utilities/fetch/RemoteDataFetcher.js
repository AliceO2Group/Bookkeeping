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
     * @template U, V where U is type of data from server response, V is type of data returned by this method
     * Server response is expected to be json with data under key `data`
     * @param {string} endpoint the endpoint to fetch
     * @param {object} options options modifying behaviour
     * @param {boolean} [options.keepExisting = false] cause that result of current call is merged with data fetched previously
     * @param {Functioin<U, V>} [options.dataTransformer = null] transform data from server response to desired format
     * @return {Promise<{data: V, totalCount: number}>} resolves once the data fetching has ended
     */
    async fetch(endpoint, { keepExisting = false, dataTransformer = null } = {}) {
        if (!keepExisting) {
            this._data = RemoteData.loading();
            this.notify();
        }

        const abortController = new AbortController();
        try {
            if (this._abortController && !keepExisting) {
                this._abortController.abort();
            }
            this._abortController = abortController;
            const remoteJson = await getRemoteData(endpoint, { signal: this._abortController.signal });
            const { data = [], meta: { page: { totalCount = data.length } = {} } = {} } = remoteJson || {};

            const existingData = keepExisting ? this._data.payload || [] : [];

            this._data = RemoteData.success([...existingData, ... dataTransformer ? dataTransformer(data) : data]);
            this._totalCount = keepExisting ? this._totalCount + totalCount : totalCount;

            this.notify();
            return { data, totalCount };
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

    /**
     * Return totalCount of data
     * @return {number} totalCount of data
     */
    get totalCount() {
        return this._totalCount;
    }
}
