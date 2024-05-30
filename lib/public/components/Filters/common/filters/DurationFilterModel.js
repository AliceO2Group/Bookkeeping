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

const { DurationInputModel } = require('../../../common/form/inputs/DurationInputModel.js');
const { ComparisonOperatorSelectionModel } = require('./ComparisonOperatorSelectionModel.js');

/**
 * Duration filter model which stores time value and selected operator
 */
export class DurationFilterModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._durationInputModel = new DurationInputModel();
        this._durationInputModel.bubbleTo(this);
        this._operatorSelectionModel = new ComparisonOperatorSelectionModel();
        this._operatorSelectionModel.bubbleTo(this);
    }

    /**
     * Retrun duration input model
     *
     * @return {DurationInputModel} duration input model
     */
    get durationInputModel() {
        return this._durationInputModel;
    }

    /**
     * Return operator selection model
     *
     * @return {ComparisonOperatorSelectionModel} operator selection model
     */
    get operatorSelectionModel() {
        return this._operatorSelectionModel;
    }
}
