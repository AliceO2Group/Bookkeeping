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
import { CreationModel } from '../../../models/CreationModel.js';

/**
 * Model class storing the QC Flag Type creation state
 */
export class QCFlagTypeCreationModel extends CreationModel {
    /**
     * Constructor
     * @param {function} onCreationSuccess function called when the QC Flag Type creation is successful,
     * passing the created QC Flag Type ID as parameter
     */
    constructor(onCreationSuccess) {
        super('/api/qualityControlFlags/types', ({ id }) => onCreationSuccess(id));
    }

    /**
     * Return current data stored by model
     */
    get data() {
        return this._data;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initOrResetData() {
        this._data = new QCFlagTypeCreationFormData();
        this._data.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return { ...this._data.toPojo() };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    isValid() {
        return this._data.name.length && this._data.method.length;
    }
}

/**
 * Data storing the current value of a QC Flag Type creation form
 */
class QCFlagTypeCreationFormData extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._name = '';
        this._method = '';
        this._color = null;
        this._bad = true;
    }

    /**
     * Returns the current state as a plain old javascript object
     *
     * @return {object} the current state
     */
    toPojo() {
        return {
            name: this._name,
            method: this._method,
            bad: this._bad,
            color: this._color,
        };
    }

    /**
     * Returns the currently inserted name from the QC Flag Type creation screen.
     *
     * @returns {string} The name currently inserted in the QC Flag Type creation screen.
     */
    get name() {
        return this._name;
    }

    /**
     * Sets the name for the QC Flag Type creation screen to a newly provided name.
     *
     * @param {string} name The newly inserted name.
     */
    set name(name) {
        this._name = name;
        this.notify();
    }

    /**
     * Returns the currently inserted method from the QC Flag Type creation screen.
     *
     * @returns {string} The method currently inserted in the QC Flag Type creation screen.
     */
    get method() {
        return this._method;
    }

    /**
     * Sets the method for the QC Flag Type creation screen to a newly provided method.
     *
     * @param {string} method The newly inserted method.
     */
    set method(method) {
        this._method = method;
        this.notify();
    }

    /**
     * Getter for color
     *
     * @returns {String} The color of the QC Flag Type.
     */
    get color() {
        return this._color;
    }

    /**
     * Setter for color
     *
     * @param {string} color the color of the QC Flag Type.
     */
    set color(color) {
        this._color = color;
        this.notify();
    }

    /**
     * Getter for info whether flag is bad
     * @returns {boolean} bad the info whether it's bad.
     */
    get bad() {
        return this._bad;
    }

    /**
     * Setter for info whether flag is bad
     * @param {boolean} bad the info whether it's bad.
     */
    set bad(bad) {
        this._bad = bad;
        this.notify();
    }
}
