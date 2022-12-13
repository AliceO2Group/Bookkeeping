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

import { FilterModel } from '../FilterModel.js';

export const COMPARISON_OPERATORS = ['<', '<=', '=', '>=', '>'];
export const DEFAULT_COMPARISON_OPERATOR = '=';

/**
 * Model representing comparison operator filter
 *
 * @template T
 */
export class ComparisonOperatorFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._operator = DEFAULT_COMPARISON_OPERATOR;

        /**
         * @type {(T|null)}
         * @private
         */
        this._limit = null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @override
     * @inheritDoc
     */
    reset() {
        this._operator = DEFAULT_COMPARISON_OPERATOR;
        this._limit = null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     * @override
     */
    get isEmpty() {
        return this._limit === null;
    }

    /**
     * Updates the value of the operator and limit
     *
     * @param {object} raw the raw operator or/and limit of the filter
     *
     * @return {void}
     */
    update({ operator: rawOperator, limit: rawLimit }) {
        const operator = COMPARISON_OPERATORS.includes(rawOperator) ? rawOperator : this._operator;
        let limit = this._limit;
        if (rawLimit !== undefined) {
            try {
                limit = this.parseLimit(rawLimit);
            } catch (e) {
                // Keep the current limit
            }
        }
        const previousOperator = this._operator;
        this._operator = operator;

        const previousLimit = this._limit;
        this._limit = limit;

        if (previousOperator !== this._operator || previousLimit !== this._limit) {
            this.notify();
        } else {
            this.visualChange$.notify();
        }
    }

    /**
     * Parse the given limit into a limit compatible for the current filter
     *
     * As a default, returns raw limit without modification. Models for specific comparison filter must handle parse here
     *
     * @param {*} rawLimit the raw value of the limit
     *
     * @return {T} the parsed limit
     * @protected
     */
    parseLimit(rawLimit) {
        return rawLimit;
    }

    /**
     * Returns the current operator
     *
     * @return {string} the operator
     */
    get operator() {
        return this._operator;
    }

    /**
     * Returns the current limit
     *
     * @return {T} the current limit
     */
    get limit() {
        return this._limit;
    }
}
