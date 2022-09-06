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

const ORDERS = [null, 'asc', 'desc'];

/**
 * Model storing sort state
 */
export class SortModel extends Observable {
    /**
     * Simple constructor
     */
    constructor() {
        super();

        // eslint-disable-next-line prefer-destructuring
        this._appliedDirection = this.defaultOrder;

        this._appliedOn = null;

        this._previewOn = null;

        this._visualChange$ = new Observable();
    }

    /**
     * Return the direction of the sort applied on a given column
     *
     * @param {string} column the column key for which sort direction is queried
     *
     * @return {string|null} the applied direction
     */
    getAppliedDirection(column) {
        return column === this._appliedOn ? this._appliedDirection : this.defaultOrder;
    }

    /**
     * Return the preview direction applied on a given column
     *
     * @param {string} column the key of the column for which preview direction must be returned
     *
     * @return {string|null} the preview direction
     */
    getPreviewDirection(column) {
        if (!this.isPreviewOn(column)) {
            return null;
        }

        return this._previewOn && this.getNextOrder(column === this._appliedOn ? this._appliedDirection : this.defaultOrder);
    }

    /**
     * Define the new current direction and column by cycling the current one
     *
     * @param {string} column the column key on which sorting must apply
     *
     * @return {void}
     */
    cycleDirection(column) {
        if (column !== this._appliedOn) {
            this._appliedOn = column;
            this._appliedDirection = this.defaultOrder;
        }

        this._appliedDirection = this.getNextOrder(this._appliedDirection);

        if (this._appliedDirection === null) {
            this._appliedOn = null;
        }

        this.notify();
    }

    /**
     * Returns the order right after the given one (cycling)
     *
     * @param {string|null} order the current order
     *
     * @return {string|null} the next order
     */
    getNextOrder(order) {
        const newDirectionIndex = (ORDERS.findIndex((direction) => direction === order) + 1) % ORDERS.length;
        return ORDERS[newDirectionIndex];
    }

    /**
     * States if there is a preview on the given column
     *
     * @param {string} column the column on which there is a preview
     *
     * @return {boolean} true if the column has the sort preview
     */
    isPreviewOn(column) {
        return column === this._previewOn;
    }

    /**
     * Define the column on which preview must be enabled
     *
     * @param {string} column the key of the column on which preview must be enabled
     *
     * @return {void}
     */
    set previewOn(column) {
        this._previewOn = column;
        this._visualChange$.notify();
    }

    /**
     * If the given column is currently under sort preview, unset it from preview
     *
     * @param {string} column the column to unset from preview
     *
     * @return {void}
     */
    unsetPreviewOn(column) {
        if (column === this._previewOn) {
            this._previewOn = null;
            this._visualChange$.notify();
        }
    }

    /**
     * Return the default sorting order
     *
     * @return {string|null} the default order
     */
    get defaultOrder() {
        return ORDERS[0];
    }

    /**
     * Return the direction applied on the currently sorted column
     *
     * @return {string|null} the currently applied direction
     */
    get appliedDirection() {
        return this._appliedDirection;
    }

    /**
     * Return the key of the column on which direction is currently applied
     *
     * @return {string|null} the column key
     */
    get appliedOn() {
        return this._appliedOn;
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
