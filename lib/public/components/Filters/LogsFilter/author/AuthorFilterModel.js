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

import { ParsedInputFilterModel } from '../../common/filters/ParsedInputFilterModel.js';

/**
 * Parse raw author input into a normalized array.
 *
 * @param {string} raw a raw, comma-seperated string
 * @returns {string}
 */
const parseAuthors = (raw) => raw
    .split(',')
    .map((author) => author.trim())
    .filter(Boolean)
    .join(',');

/**
 * Model to handle the state of the Author Filter
 */
export class AuthorFilterModel extends ParsedInputFilterModel {
    /**
     * Constructor
     *
     * @constructor
     */
    constructor() {
        super(parseAuthors);
    }

    /**
     * States whether the author filter contains the query for excluding anonymous authors.
     *
     * @return {boolean} true if '!Anonymous' is included in the raw filter string, false otherwise.
     */
    isAnonymousExcluded() {
        return this._raw.includes('!Anonymous');
    }

    /**
     * Append the exclude anonymous query to the author filter if it is not already included.
     *
     * @returns {void}
     */
    toggleAnonymousFilter() {
        if (this.isAnonymousExcluded()) {
            this._raw = this._raw.split(',')
                .filter((author) => author.trim() !== '!Anonymous')
                .join(',');
        } else {
            this._raw += super.isEmpty ? '!Anonymous' : ', !Anonymous';
        }

        this._value = this._parse(this._raw);
        this.notify();
    }
}
