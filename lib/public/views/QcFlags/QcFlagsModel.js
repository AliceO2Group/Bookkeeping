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

import { QcFlagsOverviewModel } from './Overview/QcFlagsOverviewModel.js';
import { Observable } from '/js/src/index.js';

/**
 * Quality Control Flags model
 */
export class QcFlagsModel extends Observable {
    /**
     * The constructor of the model
     */
    constructor() {
        super();

        this._overviewModel = new QcFlagsOverviewModel();
        this._overviewModel.bubbleTo(this);
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadOverview({ dataPassId, runNumber, dplDetectorId }) {
        this._overviewModel.runNumber = parseInt(runNumber, 10);
        this._overviewModel.dataPassId = parseInt(dataPassId, 10);
        this._overviewModel.dplDetectorId = parseInt(dplDetectorId, 10);
        this._overviewModel.load();
    }

    /**
     * Reset the overview page model to its default state
     * @returns {void}
     */
    clearOverview() {
        this._overviewModel.reset();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QcFlagsOverviewModel} the overview model
     */
    get overviewModel() {
        return this._overviewModel;
    }
}
