/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { FilterModel } from '../common/FilterModel.js';

/**
 * Time-range filter model
 */
export class MultiCompositionFilterModel extends FilterModel {
    /**
     * Constructor
     * @param {Object<string|number, FilterModel|SelectionModel>} filters the filters that will make up the composite filter
     */
    constructor(filters = {}) {
        super();

        /**
         * @type {Object<string|number, FilterModel|SelectionModel>}
         */
        this._filters = {};

        Object.entries(filters).forEach(([key, filter]) => this.putFilter(key, filter));
    }

    /**
     * Return a subfilter by key
     *
     * @param {string} key the key of the subfilter
     * @return {FilterModel} the subfilter
     */
    putFilter(key, filterModel) {
        if (key in this._filters) {
            return;
        }

        this._filters[key] = filterModel;
        this._addSubmodel(filterModel);
    }

    /**
     * Add new subfilter
     *
     * @param {string} key key of the subfilter
     * @param {FilterModel} filter the the subfilter
     */
    getFilter(key) {
        if (!(key in this._filters)) {
            throw new Error(`No filter found with key ${key}`);
        }

        return this._filters[key];
    }

    /**
     * @inheritDoc
     */
    reset() {
        Object.values(this._filters).forEach((filter) => filter.reset());
    }

    /**
     * @inheritDoc
     */
    get isEmpty() {
        return Object.values(this._filters).every((filter) => filter.isEmpty);
    }

    /**
     * @inheritDoc
     */
    get normalized() {
        const normalized = {};

        for (const [id, detector] of Object.entries(this._filters)) {
            if (!detector.isEmpty) {
                normalized[id] = detector.normalized;
            }
        }

        return normalized;
    }
}
