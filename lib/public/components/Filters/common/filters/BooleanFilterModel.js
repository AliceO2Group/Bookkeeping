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
import { FilterModel } from '../FilterModel.js';
import { SelectionModel } from '../../../common/selection/SelectionModel.js';

/**
 * Filter model to sort on boolean values
 */
export class BooleanFilterModel extends FilterModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._value = null;
        this._selectionModel = new SelectionModel({
            allowEmpty: false,
            defaultSelection: [{ value: null }],
            multiple: false,
            availableOptions: [
                { label: 'ANY', value: null },
                { label: 'ON', value: true },
                { label: 'OFF', value: false },
            ],
        });
        this._selectionModel.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._selectionModel.reset();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isEmpty() {
        return this._selectionModel.current === null;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return this._selectionModel.current;
    }

    /**
     * Returns the underlying selection model
     *
     * @return {SelectionModel} the selection model
     */
    get selectionModel() {
        return this._selectionModel;
    }
}
