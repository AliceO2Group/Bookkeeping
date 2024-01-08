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
 * @typedef {Object} Modal
 * @property {string|vnode|array<vnode|string>} content the content to display in the modal. If the content need to be re-evaluated each time
 *     the modal container is re-painted, provide a function that return the content instead of a static content
 * @property {boolean} [dismissButton] true to display a button that will simply dismiss the modal onclick
 * @property {"small"|"medium"|"large"} size the pre-defined size of the modal
 */

/**
 * Model class for a modal stack
 * If a modal is displayed when another one is already displayed, the new one will replace the previous until it is dismissed. When a modal is
 * dismissed, the previous one will then be displayed until it is displayed, and so on
 */
export class ModalModel extends Observable {
    // eslint-disable-next-line require-jsdoc
    constructor() {
        super();

        this._stack = [];
    }

    /**
     * Display a new modal
     *
     * @param {Modal} modal the modal to display
     *
     * @return {void}
     */
    display(modal) {
        this._stack.unshift(modal);
        this.notify();
    }

    /**
     * Remove a modal (defaults to the currently active modal) from the display stack
     *
     * If the dismissed modal is the current one, replace it by the previous one (if it exists)
     *
     * @param {Modal|null} [modal] the modal to dismiss, or null to dismiss the current one
     *
     * @return {void}
     */
    dismiss(modal = null) {
        if (modal === null) {
            this._stack.shift();
        } else {
            this._stack = this._stack.filter((stackModal) => modal !== stackModal);
        }
        this.notify();
    }

    /**
     * Returns the current modal or null if there is none
     *
     * @return {Modal|null} the current modal
     */
    get current() {
        return this._stack[0] ?? null;
    }
}
