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
import { ItemDetailsModel } from '../../../models/ItemDetailsModel.js';

/**
 * Model storing a given QC Flag Type details state
 */
export class QCFlagTypeDetailsModel extends ItemDetailsModel {
    /**
     * Constructor
     */
    constructor() {
        super('/api/qualityControlFlags/types');
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    resetPatch() {
        this.item.match({
            Success: (qcFlagType) => {
                this.patch = new QCFlagTypePatchFormData({
                    name: qcFlagType.name,
                    method: qcFlagType.method,
                    bad: qcFlagType.bad,
                    archived: qcFlagType.archived,
                    color: qcFlagType.color,
                });
                this.patch.bubbleTo(this);
            },
            Other: () => null,
        });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    _getSerializablePatch() {
        return { ...this.patch.toPojo() };
    }
}

/**
 * Data storing the current value of a QC Flag Type patch form
 */
class QCFlagTypePatchFormData extends Observable {
    /**
     * Constructor
     * @param {object} initParameters initial parameters
     */
    constructor(initParameters) {
        super();
        this._name = initParameters.name;
        this._method = initParameters.method;
        this._color = initParameters.colot;
        this._bad = initParameters.bad;
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
     * @returns {void}
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
     * @returns {void}
     */
    set method(method) {
        this._method = method;
        this.notify();
    }

    /**
     * Getter for bad info
     *
     * @returns {String} The bad info of the QC Flag Type.
     */
    get bad() {
        return this._bad;
    }

    /**
     * Setter for bad info
     *
     * @param {boolean} bad the bad info of the QC Flag Type.
     * @returns {void}
     */
    set bad(bad) {
        this._bad = bad;
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
     * @param {String} color the color of the QC Flag Type.
     * @returns {void}
     */
    set color(color) {
        this._color = color;
        this.notify();
    }
}
