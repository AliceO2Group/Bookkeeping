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
import { Observable } from '/js/src/index.js';

/**
 * Observable providing a snapshot of a data that may change over time, notifying every time the value change
 */
export class ObservableData extends Observable {
    /**
     * Constructor
     * @template T
     *
     * @param {T} initial the initial value of the observable data
     */
    constructor(initial) {
        super();
        this._current = initial;
    }

    /**
     * Returns the current value of the data
     * @return {T} the current value
     */
    get current() {
        return this._current;
    }

    /**
     * Set the current value of the data and notify
     * @param {T} value the current value
     */
    set current(value) {
        this._current = value;
        this.notify();
    }

    /**
     * Silently set value of observable data
     * @param {*} value new value
     * @return {void}
     */
    setSilent(value) {
        this._current = value;
    }
}
