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
import { DataSource } from '../DataSource.js';

/**
 * * @template U
 *
 * Class to abstract paginatio of RemoteData
 * This DataSource required underlying one of @type {DataSource<RemoteData<U[]>>}
 */
export class PaginatedRemoteDataSource extends DataSource {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {ObservableData<RemoteData<U[]>>}
         */
        this._observableData = new ObservableData(RemoteData.notAsked());
        this._presevedObservableData = new ObservableData(null);
    }

    /**
     * Set new underlying data source
     * @param {DataSource<RemoteData<U[]>>} dataSource the data source
     */
    set dataSource(dataSource) {
        this._dataSource = dataSource;
        this._dataSource.observableData.observe(() => {
            this._dataSource.observableData.current.match({
                Success: () => {
                    const newData = this._dataSource.observableData.current.payload;
                    const data = this._keepExisting ? this._observableData.current.payload : [] ?? [];
                    this._observableData.current = RemoteData.Success([...data, ... newData]);
                },
                Failure: () => {
                    this._presevedObservableData.current = this._observableData.current.isSuccess() ? this._observableData.current : null;
                    this._observableData.current = this._dataSource.observableData.current;
                },
                NotAsked: () => {
                    throw new Error('Invalid state');
                },
                Loading: () => {
                    this._observableData.current = this._keepExisting
                        ? this._observableData.current
                        : this._dataSource.observableData.current;
                },
            });
        });
    }

    /**
     * Fetch the given endpoint to fill current data
     *
     * @param {string} [args.endpoint] the endpoint to fetch
     * @param {boolean} [args.keepExisting] if true data from previos (if successful) call are preserved and merged with new one
     * @return {Promise<void>} resolves once the data fetching has ended
     */
    async fetch({ endpoint, keepExisting = false }) {
        this._keepExisting = keepExisting;
        if (!this._dataSource) {
            throw new Error('Data source not provided');
        }
        await this._dataSource.fetch({ endpoint });
    }
}
