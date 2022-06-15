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
 * Model to handle the state of a tag picker
 */
export class TagPickerModel extends Observable {
    /**
     * Model's constructor, collapsed and without selection as a default (default are used as initial state and when the picker is reset)
     *
     * @param {Object[]} defaultSelection the default selection of tags
     * @param {boolean} defaultCollapsed true if the tags must be collapsed as a default
     *
     * @constructor
     */
    constructor(defaultSelection = [], defaultCollapsed = true) {
        super();
        this._defaultSelection = defaultSelection;
        this._selected = [...defaultSelection];

        this._defaultCollapsed = defaultCollapsed;
        this._collapsed = defaultCollapsed;
    }

    /**
     * States if the picker selection is exactly the default one
     *
     * @return {boolean} true if the selection is the default one
     */
    hasOnlyDefaultSelection() {
        const selected = [...new Set(this._selected.map(({ id }) => id))];
        const defaultSelection = [...new Set(this._defaultSelection.map(({ id }) => id))];

        return selected.length === defaultSelection.length && selected.every((item) => defaultSelection.includes(item));
    }

    /**
     * If the picker is collapsed expand it, else collapse it
     *
     * @return {void}
     */
    toggleCollapse() {
        this._collapsed = !this._collapsed;
        this.notify();
    }

    /**
     * Reset the model to its default state
     *
     * @return {void}
     */
    reset() {
        this._selected = [...this._defaultSelection];
        this._collapsed = this._defaultCollapsed;
    }

    /**
     * Returns the collapse status
     *
     * @return {boolean} true if the picker is collapsed
     */
    get collapsed() {
        return this._collapsed;
    }

    /**
     * Return the list of currently selected tags
     *
     * Do not use this getter to modify the selected list but use the selected setter to define the new selected list and to notify observers
     *
     * @return {Object[]} the selected tags
     */
    get selected() {
        return this._selected;
    }

    /**
     * Define (overrides) the list of currently selected tags
     *
     * @param {Object[]} selected the list of selected tags
     */
    set selected(selected) {
        this._selected = selected;
        this.notify();
    }
}
