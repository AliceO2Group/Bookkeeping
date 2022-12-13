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
import { arrayHasSameContent } from '../../../../utilities/arrayHasSameContent.js';
import { FilterModel } from '../FilterModel.js';

/**
 * Model for a coma separated values filter
 *
 * This filter input is a comma separated list of values and its value is an array of values
 */
export class CommaSeparatedValuesFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._values = null;
        this._raw = '';
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    reset() {
        this._values = null;
        this._raw = '';
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    get isEmpty() {
        const { values } = this;
        return !values || values.length === 0;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    get normalized() {
        return this.values;
    }

    /**
     * Define the current value of the filter
     *
     * @param {string} raw the raw value of the filter
     * @param {array} values the list of parsed values of the filter
     *
     * @return {void}
     */
    update(raw, values) {
        const previousValues = [...this._values || []];

        this._values = values;
        this._raw = raw;

        if (arrayHasSameContent(values || [], previousValues)) {
            // Only raw value changed
            this.visualChange$.notify();
        } else {
            this.notify();
        }
    }

    /**
     * Returns the raw value of the filter (the user input)
     *
     * @return {string} the raw value
     */
    get raw() {
        return this._raw;
    }

    /**
     * Return the parsed values of the filter
     *
     * @return {array} the parsed values
     */
    get values() {
        if (!Array.isArray(this._values) || this._values.length === 0) {
            return null;
        }
        return this._values;
    }
}
