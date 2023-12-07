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
import { ObservableData } from '../ObservableData.js';
import { getRemoteData } from './getRemoteData.js';
import { RemoteDataSource } from './RemoteDataSource.js';

/**
 * Class to abstract notifying from data changes
 * @template U, V
 * Server response is expected to be of type @type { data: U, meta: Optional<{ page: { totalCount: number } }> }
 */
export class PaginatableRemoteDataSource extends RemoteDataSource {
    /**
     * Constructor
     * @param {object} [options] options modifying behaviour
     * @param {Function<U, V>} [options.dataTransformer = null] function to transform response of server
     */
    constructor(options) {
        super();
        this._options = options;
        this._endpoint = null;
        this._observablePage = new ObservableData();
    }

    /**
     * Fetch the given endpoint to fill current data
     *
     * @param {string} endpoint the endpoint to fetch
     * @return {Promise<void>} resolves once the data fetching has ended
     */
    async fetch(endpoint, { keepExisting }) {
        const abortController = new AbortController();
        try {
            if (this._abortController && !keepExisting) {
                this._abortController.abort();
                this._observableData.current = RemoteData.loading();
            }
            this._abortController = abortController;
            const { data, meta: { page } = {} } = await getRemoteData(endpoint, { signal: this._abortController.signal });
            this._observableData.current = RemoteData.success([
                ... keepExisting ? this._observableData.current.payload ?? [] : [],
                ... this._options.dataTransformer?.(data) ?? data,
            ]);
            this._observablePage.current = { totalCount: page?.totalCount ?? data.length };
        } catch (error) {
            // Use local variable because the class member (this._abortController) may already have been override in another call
            if (!abortController.signal.aborted) {
                this._observableData.current = RemoteData.failure(error);
            }
        }
    }

    /**
     * Return the observable remote data provided by this source
     *
     * @return {ObservableData<{totalCount: number, pageCount: number}>} the observable remote data
     */
    get observablePage() {
        return this._observablePage;
    }
}
