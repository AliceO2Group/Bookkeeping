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

import { RemoteData, Observable } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

const emptyEorReason = {
    category: '',
    title: '',
    description: '',
};

/**
 * Model storing state of a selection of run types picked from the list of all the existing run types
 */
export class EorReasonFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._visualChange$ = new Observable();
        this._eorReasonTypes = RemoteData.notAsked();
        this._fetchReasonTypes();
        this._filterEorReason = { ...emptyEorReason };
    }

    /**
     * Retrieve a list of reason types from the API
     *
     * @return {Promise<void>} resolves once the data has been fetched
     */
    async _fetchReasonTypes() {
        this._eorReasonTypes = RemoteData.loading();
        this._visualChange$.notify();

        try {
            const { data: reasonTypes } = await getRemoteData('/api/runs/reasonTypes');
            this._eorReasonTypes = RemoteData.success(reasonTypes);
        } catch (error) {
            this._eorReasonTypes = RemoteData.failure(error);
        }

        this._visualChange$.notify();
    }

    /**
     * Returns an observable notified any time a visual change occurs that has no impact on the actual selection
     * @return {Observable} the visual change observable
     */
    get visualChange$() {
        return this._visualChange$;
    }

    /**
     * Returns a boolean indicating whether this filter is considered empty
     * @return {boolean} indicating whether this filter is considered empty
     */
    isEmpty() {
        return this._filterEorReason.category === '' && this._filterEorReason.title === '' && this._filterEorReason.description === '';
    }

    /**
     * Empties the filter. this.isEmpty() evaluates to true.
     * @return {void}
     */
    reset() {
        this._filterEorReason = { ...emptyEorReason };
    }

    /**
     * Gets an object of url params to value for the api query
     * @return {Object} url query parameter to parameter value
     */
    getFilterQueryParams() {
        return {
            ...this.filterEorReason.category !== '' && { 'filter[eorReason][category]': this.filterEorReason.category },
            ...this.filterEorReason.title !== '' && { 'filter[eorReason][title]': this.filterEorReason.title },
            ...this.filterEorReason.description !== '' && { 'filter[eorReason][description]': this.filterEorReason.description },
        };
    }

    /**
     * Sets the category of the new EOR reason filter, and resets the title since the titles
     * are different for each category.
     * @param {string} category the category of the new EOR reason filter
     * @return {void}
     */
    setFilterEorReasonCategory(category) {
        this._filterEorReason.category = category;
        this._filterEorReason.title = emptyEorReason.title;
        this.notify();
    }

    /**
     * Sets the title of the new EOR reason filter
     * @param {string} title the title of the EOR reason filter
     * @return {void}
     */
    setFilterEorReasonTitle(title) {
        this._filterEorReason.title = title;
        this.notify();
    }

    /**
     * Sets the description of the new EOR reason filter
     * @param {string} description the description of the new EOR reason
     * @return {void}
     */
    setFilterEorReasonDescription(description) {
        this._filterEorReason.description = description;
        this.notify();
    }

    /**
     * Getter for the EOR reason types
     * @return {Object} the EOR reason type
     */
    get eorReasonTypes() {
        return this._eorReasonTypes;
    }

    /**
     * Setter for the EOR reason types
     * @param {Object} reasonTypes object representing the possible EOR reason types
     * @return {void}
     */
    set eorReasonTypes(reasonTypes) {
        this._eorReasonTypes = reasonTypes;
    }

    /**
     * Getter for the current EOR reason
     * @return {Object} the EOR reason
     */
    get filterEorReason() {
        return this._filterEorReason;
    }
}
