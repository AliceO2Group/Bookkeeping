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
import { RemoteDataSource } from './RemoteDataSource.js';
import { ObservableData } from '../ObservableData.js';

/**
 * @template T
 *
 * @typedef PaginatedData
 * @property {T[]} data
 * @property {object} meta
 */

/**
 * Class to abstract notifying from data changes
 * @template U, V
 * Raw, fetched data are expected to be of @type {PaginatedData<U>}
 */
export class PaginatedRemoteDataSource extends RemoteDataSource {
    /**
     * Constructor
     * @param {object} [options] options modifying behaviour
     * @param {Function<U[], V[]>} [options.dataTransformer = null] function to transform response of server
     */
    constructor(options) {
        super();
        this._options = options;
        this._remoteDataSource = new RemoteDataSource();
        this._observableData = new ObservableData(RemoteData.notAsked());
        this._presevedObservableData = new ObservableData(null);

        this._remoteDataSource.observableData.observe(() => {
            this._remoteDataSource.observableData.current.match({
                Success: () => {
                    const { data: newData, meta: newMeta } = this._remoteDataSource.observableData.current.payload;
                    const { data = [] } = this._observableData.current.payload ?? {};
                    this._observableData.current = RemoteData.Success({
                        data: [...data, ...this._options.dataTransformer?.(newData) ?? newData],
                        meta: newMeta,
                    });
                },
                Failure: () => {
                    this._presevedObservableData.current = this._observableData.current.isSuccess() ? this._observableData.current : null;
                    this._observableData.current = this._remoteDataSource.observableData.current;
                },
                NotAsked: () => {
                    throw new Error('Invalid state');
                },
                Loading: () => {
                    this._observableData.current = this._keepExisting
                        ? this._observableData.current
                        : this._remoteDataSource.observableData.current;
                },
            });
        });
    }

    /**
     * Fetch the given endpoint to fill current data
     *
     * @param {string} endpoint the endpoint to fetch
     * @return {Promise<void>} resolves once the data fetching has ended
     */
    async fetch(endpoint, { keepExisting = false }) {
        this._keepExisting = keepExisting;
        this._remoteDataSource.fetch(endpoint);
    }

    /**
     * Return the observable remote data provided by this source
     * @return {ObservableData<PaginatedData<V>>} the observable remote data
     */
    get observableData() {
        return this._observableData;
    }
}
