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
import { Observable } from '/js/src/index.js';

/**
 * Model storing the state of a given filter
 * @abstract
 */
export class FilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._visualChange$ = new Observable();
    }

    /**
     * Reset the filter to its initial state
     *
     * @return {void}
     * @abstract
     */
    reset() {
        throw new Error('Abstract function call');
    }

    /**
     * States if the filter has been filled with a valid value
     *
     * @return {boolean} true if the filter is filled
     * @abstract
     */
    get isEmpty() {
        throw new Error('Abstract function call');
    }

    /**
     * Returns the normalized value of the filter, that can be used as URL parameter
     *
     * @return {string|number|object|array|null} the normalized value
     * @abstract
     */
    get normalized() {
        throw new Error('Abstract function call');
    }

    /**
     * Returns the observable notified any time there is a visual change which has no impact on the actual filter value
     *
     * @return {Observable} the observable
     */
    get visualChange$() {
        return this._visualChange$;
    }
}
