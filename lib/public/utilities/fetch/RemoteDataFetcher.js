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
 * @template T
 */
class ObservableData extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {T}
         */
        this._data = null;
    }

    /**
     * Set data and notify observers
     * @param {T} data new data
     */
    set data(data) {
        this._data = data;
        this.notify();
    }

    /**
     * Return current data
     * @return {T} data
     */
    get data() {
        return this._data;
    }
}

/**
 * Class to abstract data access from acquiring
 * @template T
 */
class DataSource extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {ObservableData<T>}
         */
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
     * @return {ObservableData<T>} the current observable data
     */
    get observableData() {
        return this._observableData;
    }
}

/**
 * Service class providing observable data fetching process
 * @template U, V where U is type of data from server response,
 * @type { ObservableData<RemoteData<T>> } is type of data being served by this class
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

    /**
     * Return the current observable data
     * @return {ObservableData<RemoteData<T>>} the current observable data
     */
    get observableData() {
        return this._observableData;
    }
}

// eslint-disable-next-line valid-jsdoc
/**
 * @inheritDoc
 */
export class PaginatableRemoteDataSource extends RemoteDataSource {
    /**
     * Constructor
     * @param {object} [options] options modifying behaviour
     * @param {Function<U, V>} [options.dataTransformer = null] function to transform response of server
     * it is called if keepExisting flag is specified @see PaginatableRemoteDataSource.acquire
     * @param {Function<U, void>} [options.onSuccess = null] function called with raw response from server if successful
     */
    constructor(options) {
        super(options);
        this._endpoint = null;
        this._page = null;
    }

    /**
     * Fetch the given endpoint to fill current data
     * @param {string|URL} endpoint the endpoint to fetch
     * @return {Promise<void>} promise
     */
    async acquire(endpoint) {
        const abortController = new AbortController();
        try {
            this._abortController.abort();
            this._abortController = abortController;
            // This._observableData.data = RemoteData.loading();

            const { subPaginations, validDataSliceRange } = this._paginationForMissingData(endpoint);
            const currentValidDataSlice = this._getValidDataSlice(validDataSliceRange);

            const dataCalls = [
                await this._callIfNeeded(endpoint, subPaginations[0]),
                { data: currentValidDataSlice, meta: this._page },
                await this._callIfNeeded(endpoint, subPaginations[1]),
            ].reduce((acc, { data, meta}) => {
                acc.data = acc.data.concat(data);
                this._
            }, { data: [], meta: {} });

            const { dataTransformer, onSuccess } = this._options;
            await onSuccess?.(response);
            this._observableData.data =
                RemoteData.success(dataTransformer?.(response) ?? response);
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._observableData.data = RemoteData.failure(error);
            }
        }
    }

    // eslint-disable-next-line require-jsdoc
    _metaDataCheck(storedMetaData, meta) {
        if (!storedMetaData?.page?.totalCount) {
            storedMetaData.page = { totalCount: meta.page.totalCount };
        } else {
            if (meta.page.totalCount && storedMetaData.page.totalCount !== meta.page.totalCount) {
                throw new Error('Inconsisten server response');
            }
        }
        return storedMetaData;
    }

    // eslint-disable-next-line require-jsdoc
    async _callIfNeeded(endpoint, subPagination) {
        return subPagination.limit > 0
            ? await getRemoteData(this._applyPaginationToEndpoint(endpoint, subPagination), { signal: this._abortController.signal })
            : { data: [], meta: {} };
    }

    // eslint-disable-next-line require-jsdoc
    _applyPaginationToEndpoint(endpoint, { offset, limit }) {
        const newEndpoint = new URL(endpoint);
        newEndpoint.searchParams.set('page[offset]', offset);
        newEndpoint.searchParams.set('page[limit]', limit);
        return newEndpoint;
    }

    /**
     * Return data valid for next call
     * @param {{lower: number, higher: number}} validDataSliceRange slice definition
     * @return {V[]} data array
     */
    _getValidDataSlice(validDataSliceRange) {
        return validDataSliceRange
            ? this.observableData.data.payload.slice(validDataSliceRange.lower, validDataSliceRange.higher)
            : [];
    }

    /**
     * Calculate pagination for next fetching in case some data are already stored
     * @param {URL} endpoint endpoint
     * @return {object} pagination calculation
     */
    _paginationForMissingData(endpoint) {
        const { 'page[offset]': nextOffset, 'page[limit]': nextLimit } = endpoint.searchParams;
        if (!this._observableData.data.isSuccess) {
            return {
                subPaginations: [{ offset: nextOffset, limit: nextLimit }],
                validDataSliceRange: null,
            };
        }
        const { 'page[offset]': previousOffset, 'page[limit]': previousLimit } = this._endpoint.searchParams;
        if (nextOffset + nextLimit < previousOffset ||
            previousOffset + previousLimit < nextOffset) {
            return {
                subPaginations: [{ offset: nextOffset, limit: nextLimit }],
                validDataSliceRange: null,
            };
        }
        const inclusiveSliceLowerBound = Math.max(nextOffset, previousOffset);
        const inclusiveSliceHigherBound = Math.min(nextOffset + nextLimit, previousOffset + previousLimit);
        const [lowerRange, higherRange] = [
            { offset: nextOffset, limit: nextLimit },
            { offset: previousOffset, limit: previousLimit },
        ].sort((a, b) => a.offset - b.offset);

        return {
            subPaginations: [
                {
                    offset: lowerRange.offset,
                    limit: inclusiveSliceLowerBound - lowerRange.offset,
                },
                {
                    offset: inclusiveSliceHigherBound,
                    limit: higherRange.limit - (inclusiveSliceHigherBound - higherRange.offset),
                },
            ],
            validDataSliceRange: {
                lower: inclusiveSliceLowerBound,
                higher: inclusiveSliceHigherBound + 1,
            },
        };
    }
}
