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
 * Filter model based on a selection model
 */
export class SelectionFilterModel extends FilterModel {
    /**
     * Constructor
     *
     * @param {object} [configuration] the selection filter configuration
     * @param {SelectionOption[]} [configuration.availableOptions=[]] the list of available options
     */
    constructor(configuration) {
        super();

        this._selectionModel = new SelectionModel({ availableOptions: configuration.availableOptions });
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
        return this._selectionModel.isEmpty;
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get normalized() {
        return this._selectionModel.selected.join(',');
    }

    /**
     * Return the underlying selection model
     *
     * @return {SelectionModel} the underlying selection model
     */
    get selectionModel() {
        return this._selectionModel;
    }
}
