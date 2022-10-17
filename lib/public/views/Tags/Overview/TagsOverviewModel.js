/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
import { Observable, RemoteData } from '/js/src/index.js';
import { debounce, INPUT_DEBOUNCE_TIME } from '../../../utilities/debounce.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';

/**
 * Model for tags overview page
 */
export class TagsOverviewModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {RemoteData}
         * @private
         */
        this._tagsList = RemoteData.notAsked();

        /**
         * Filters to apply on tags list fetching
         * @type {Object}
         * @private
         */
        this._filters = {};

        this._debouncedFetchTagsList = debounce(this.fetchTagsList.bind(this), INPUT_DEBOUNCE_TIME);
    }

    /**
     * Fetch the tags list to display, applying current filters
     *
     * @return {void}
     */
    async fetchTagsList() {
        this._tagsList = RemoteData.loading();
        this.notify();

        const params = {
            ...this._filters.partialText && {
                'filter[partialText]': this._filters.partialText,
            },
        };

        const endpoint = `/api/tags?${new URLSearchParams(params).toString()}`;

        try {
            const { items } = await getRemoteDataSlice(endpoint);
            this._tagsList = RemoteData.success(items);
        } catch (errors) {
            this._tagsList = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Reset the model to its initial state
     *
     * @return {void}
     */
    reset() {
        this._tagsList = RemoteData.notAsked();
        this._filters = {};
    }

    // Filtering

    /**
     * Returns the current partial text filter value
     *
     * @return {string|null} the current partial text filter
     */
    get partialTextFilter() {
        return this._filters.partialText;
    }

    /**
     * Set the current partial text filter (will match any tag for which text contains partial text), empty will remove
     * the filtering
     *
     * @param {string} partialText the text to contain
     *
     * @return {void}
     */
    set partialTextFilter(partialText) {
        this._filters.partialText = partialText;
        this._debouncedFetchTagsList();
    }

    // Getters

    /**
     * Returns the current tags list to display
     *
     * @return {RemoteData} the tags list
     */
    get tagsList() {
        if (this._tagsList.isNotAsked()) {
            this.fetchTagsList();
        }

        return this._tagsList;
    }
}
