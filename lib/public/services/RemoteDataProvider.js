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
import { ObservableData } from '../utilities/ObservableData.js';

/**
 * Data provider based on remote data
 *
 * @template T
 */
export class RemoteDataProvider {
    /**
     * Constructor
     */
    constructor() {
        this._items = null;

        this._items$ = ObservableData.builder()
            .initialValue(RemoteData.notAsked())
            .build();
    }

    /**
     * Return the list of items
     *
     * @return {Promise<T[]>} the items
     */
    async getItems() {
        if (!this._items) {
            this._items = await this.getRemoteData();
        }

        return this._items;
    }

    /**
     * Return the observable list of items (lazy-load it if needed)
     *
     * @return {ObservableData<RemoteData<T[], ApiError>>} the observable list of items
     */
    get items$() {
        if (this._isStale()) {
            this._load();
        }

        return this._items$;
    }

    /**
     * Fetch the data
     *
     * @return {Promise<T[]>} the fetched items
     * @abstract
     */
    getRemoteData() {
        throw new Error('Method not implemented');
    }

    /**
     * Mark the state of the provider as being stale, data will be fetched again next time it will be asked
     *
     * @return {void}
     */
    markAsStale() {
        this._items = null;
        this._items$.setCurrent(RemoteData.notAsked());
    }

    /**
     * States if the items observable has never been asked
     *
     * @return {boolean} true if the items observable has never been asked
     * @protected
     */
    _isStale() {
        return this._items$.getCurrent().match({
            NotAsked: () => true,
            Other: () => false,
        });
    }

    /**
     * Fill the items$ observable data
     *
     * @return {void}
     * @protected
     */
    _load() {
        this._items$.setCurrent(RemoteData.loading());
        this.getItems().then(
            (items) => this._items$.setCurrent(RemoteData.success(items)),
            (error) => this._items$.setCurrent(RemoteData.failure(error)),
        );
    }
}
