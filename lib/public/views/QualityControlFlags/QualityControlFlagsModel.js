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

import { QualityControlFlagCreationModel } from './Creation/QualityControlFlagCreationModel.js';
import { QualityControlFlagsOverviewModel } from './Overview/QualityControlFlagsOverviewModel.js';
import { Observable } from '/js/src/index.js';

/**
 * Quality Control Flags model
 */
export class QualityControlFlagsModel extends Observable {
    /**
     * The constructor of the model
     */
    constructor() {
        super();

        this._overviewModel = new QualityControlFlagsOverviewModel();
        this._overviewModel.bubbleTo(this);

        this._creationModel = null;
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadCreation({ dataPassId, runNumber, detectorId }) {
        const baseParameters = {
            runNumber: Number(runNumber),
            dataPassId: Number(dataPassId),
            detectorId: Number(detectorId),
        };
        this.loadOverview(baseParameters);

        this._creationModel = new QualityControlFlagCreationModel(baseParameters);
        this._creationModel.bubbleTo(this);
    }

    /**
     * Returns the model for the creation page
     * @return {QualityControlFlagCreationModel} the creation model
     */
    get creationModel() {
        return this._creationModel;
    }

    /**
     * Load the overview page model
     *
     * @returns {void}
     */
    loadOverview({ dataPassId, runNumber, detectorId }) {
        this._overviewModel.runNumber = Number(runNumber);
        this._overviewModel.dataPassId = Number(dataPassId);
        this._overviewModel.detectorId = Number(detectorId);
        this._overviewModel.load();
    }

    /**
     * Reset the overview page model to its default state
     * @returns {void}
     */
    clearOverview({ dataPassId, runNumber, detectorId }) {
        this.loadOverview({ dataPassId, runNumber, detectorId });
        this._overviewModel.reset();
    }

    /**
     * Returns the model for the overview page
     *
     * @return {QualityControlFlagsOverviewModel} the overview model
     */
    get overviewModel() {
        return this._overviewModel;
    }
}
