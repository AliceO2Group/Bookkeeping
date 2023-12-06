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
 * Class to abstract notifying from data changes
 */
class ObservableData extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._data = null;
    }

    /**
     * Set data and notify observers
     * @param {*} data new data
     */
    set data(data) {
        this._data = data;
        this.notify();
    }

    /**
     * Return current data
     */
    get data() {
        return this._data;
    }
}

/**
 * Class to abstract data access from acquiring
 */
class DataSource extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._observableData = new ObservableData();
        this._observableData.bubbleTo(this);
    }

    /**
     * Abstract method definining how data are acquired
     * @return {*} promise
     */
    acquire() {
        throw new Error('Abstract method');
    }

    /**
     * Return the current observable data
     *
     * @return {ObservableData} the current observable data
     */
    get observableData() {
        return this._observableData;
    }
}

/**
 * Service class providing observable data fetching process
 * @template U, V where U is type of data from server response, V is type of data being served by this class
 */
export class RemoteDataSource extends DataSource {
    /**
     * Constructor
     * @param {object} [options] options modifying behaviour
     * @param {Function<U, V>} [options.dataTransformer = null] function to transform response of server
     * @param {Function<U, void>} [options.onSuccess = null] function called with raw response from server if successful
     */
    constructor(options = {}) {
        super();
        this._options = options;
        this._abortController = null;
    }

    /**
     * Fetch the given endpoint to fill current data
     * @param {string} endpoint the endpoint to fetch
     * @return {Promise<void>} promise
     */
    async acquire(endpoint) {
        const abortController = new AbortController();
        try {
            this._abortController.abort();
            this._abortController = abortController;
            this._observableData.data = RemoteData.loading();
            const response = await getRemoteData(endpoint, { signal: this._abortController.signal });
            const { dataTransformer, onSuccess } = this._options;
            await onSuccess?.(response);
            this._observableData.data = RemoteData.success(dataTransformer?.(response) ?? response);
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._observableData.data = RemoteData.failure(error);
            }
        }
    }
}

/**
 * Service class providing observable data fetching process
 * @template U, V where U is type of data from server response, V is type of data being served by this class
 */
export class PaginatableRemoteDataSource extends RemoteDataSource {
    /**
     * Constructor
     * @param {object} [options] options modifying behaviour
     * @param {Function<U, V>} [options.dataTransformer = null] function to transform response of server
     * @param {Function<V, U, V>} [options.dataMerger = null] function to merging newly acuired data to existing one
     * @param {Function<U, void>} [options.onSuccess = null] function called with raw response from server if successful
     */
    constructor(options) {
        super(options);
    }

    /**
     * Fetch the given endpoint to fill current data
     * @param {string} endpoint the endpoint to fetch
     * @param {object} [options] options modifying behaviour
     * @param {object} [options.keepExisting] newly acquired data are merged to existing one
     * @return {Promise<void>} promise
     */
    async acquire(endpoint, { keepExisting } = {}) {
        const abortController = new AbortController();
        try {
            if (!keepExisting) {
                this._abortController.abort();
            }
            this._abortController = abortController;
            this._observableData.data = RemoteData.loading();
            const response = await getRemoteData(endpoint, { signal: this._abortController.signal });
            const { dataTransformer, onSuccess } = this._options;
            await onSuccess?.(response);
            this._observableData.data = RemoteData.success(dataTransformer?.(response) ?? response);
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._observableData.data = RemoteData.failure(error);
            }
        }
    }
}
