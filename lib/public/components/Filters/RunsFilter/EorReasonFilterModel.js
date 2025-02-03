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

import { FilterModel } from '../common/FilterModel.js';

/**
 * Model storing state of a selection of run types picked from the list of all the existing run types
 */
export class EorReasonFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {ObservableData<RemoteData<ReasonType[], ApiError>>} reasonTypes$ observable remote data of EoR reason types list
     */
    constructor(reasonTypes$) {
        super();
        this._reasonTypes$ = reasonTypes$;

        this._category = '';
        this._title = '';
        this._description = '';
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._category = '';
        this._title = '';
        this._description = '';
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._category === '' && this._title === '' && this._description === '';
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        const ret = {};

        if (this._category !== '') {
            ret.category = this._category;
        }
        if (this._title !== '') {
            ret.title = this._title;
        }
        if (this._description !== '') {
            ret.description = this._description;
        }

        return ret;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    hydrate(value) {
        const { category, title, description } = value;

        if (category) {
            this._category = category;
        }
        if (title) {
            this._title = title;
        }
        if (description) {
            this._description = description;
        }

        return Promise.resolve();
    }

    /**
     * Returns the EOR reason filter category
     *
     * @return {string} the category
     */
    get category() {
        return this._category;
    }

    /**
     * Sets the category of the EOR reason filter category and reset the title
     *
     * @param {string} category the category of the new EOR reason filter
     * @return {void}
     */
    set category(category) {
        this._category = category;
        this._title = '';
        this.notify();
    }

    /**
     * Returns the EOR reason filter title
     *
     * @return {string} the title
     */
    get title() {
        return this._title;
    }

    /**
     * Sets the EOR reason filter title
     *
     * @param {string} title the title of the new EOR reason filter
     * @return {void}
     */
    set title(title) {
        this._title = title;
        this.notify();
    }

    /**
     * Returns the value of EOR reason filter description
     *
     * @return {string} the description
     */
    get description() {
        return this._description;
    }

    /**
     * Sets the raw value of EOR reason filter description
     *
     * @param {string} description the description
     * @param {boolean} notify if true, the filter will notify its observers. if not, it will simply notify visual change observers.
     * @return {void}
     */
    setDescription(description, notify) {
        this._description = description;
        notify ? this.notify() : this.visualChange$.notify();
    }

    /**
     * Getter for the EOR reason types
     *
     * @return {RemoteData<ReasonType[], ApiError>} list of EoR reasons types
     */
    get eorReasonTypes() {
        return this._reasonTypes$.getCurrent();
    }
}
