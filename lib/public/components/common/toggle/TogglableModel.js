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
import { getUniqueId } from '../../../utilities/getUniqueId.js';

const OPEN_DROPDOWN_EVENT_TAG = 'click-on-dropdown';

/**
 * Simple model storing the state of a toggleable element
 */
export class ToggleableModel extends Observable {
    /**
     * Constructor
     *
     * @param {boolean} [isVisible=false] default visibility of the element
     */
    constructor(isVisible = false) {
        super();
        this._isVisible = isVisible;
        this._defaultVisibility = isVisible;
        this._closeEventTag = OPEN_DROPDOWN_EVENT_TAG + getUniqueId();
    }

    /**
     * Shows the element
     * @return {void}
     */
    show() {
        this._isVisible = true;
        this.notify();
    }

    /**
     * Hides the element
     * @return {void}
     */
    hide() {
        this._isVisible = false;
        this.notify();
    }

    /**
     * Resets the visibility to its initial state without notification
     *
     * @param {boolean} [silent=false] if true, observers will not be notified
     * @return {void}
     */
    reset(silent = false) {
        this._isVisible = this._defaultVisibility;
        if (!silent) {
            this.notify();
        }
    }

    /**
     * Returns the current visibility of the element
     *
     * @return {boolean} true if the element is visible, else return false
     */
    get isVisible() {
        return this._isVisible;
    }

    /**
     * Returns the event tag used to tag events to prevent closing toggled element when clicking on itself
     *
     * @return {string} the event tag
     */
    get closeEventTag() {
        return this._closeEventTag;
    }
}
