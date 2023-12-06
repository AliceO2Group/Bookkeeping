/* eslint-disable require-jsdoc */
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

class ObservableData extends Observable {
    constructor() {
        super();
        this._data = null;
    }

    set data(data) {
        this._data = data;
        this.notify();
    }

    get data() {
        return this._data;
    }
}

class DataSource extends Observable {
    constructor() {
        super();
        this._observableData = new ObservableData();
        this._observableData.bubbleTo(this);
    }

    /**
     * Return the current observable data wrapper
     *
     * @return {ObservableData} the current observable data
     */
    get observableData() {
        return this._observableData;
    }
}

/**
 * Service class providing observable data fetching process
 */
export class RemoteDataSource extends DataSource {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._abortController = null;
    }

    /**
     * Fetch the given endpoint to fill current data
     *
     * @template U, V where U is type of data from server response, V is type of data returned by this method
     * Server response is expected to be json with data under key `data`
     * @param {string} endpoint the endpoint to fetch
     * @param {object} options options modifying behaviour
     * @param {boolean} [options.keepExisting = false] cause that result of current call (if successful) is merged with data fetched previously
     * @param {Functioin<U, V>} [options.dataTransformer = null] transform data from server response to desired format
     * @return {Promise<{data: V, totalCount: number}>} resolves once the data fetching has ended
     */
    async fetch(endpoint) {
        const abortController = new AbortController();
        try {
            this._abortController.abort();
            this._abortController = abortController;
            this._observableData.data = RemoteData.loading();
            this._observableData.data = RemoteData.success(await getRemoteData(endpoint, { signal: this._abortController.signal }));
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._observableData.data = RemoteData.failure(error);
            }
        }
    }
}
