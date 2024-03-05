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
import { QCFlagTypesOverviewModel } from './Overview/QCFlagTypesOverviewModel.js';
import { QCFlagTypeCreationModel } from './Create/QCFlagTypeCreationModel.js';

/**
 * QC Flag Types model
 */
export class QCFlagTypesModel extends Observable {
    /**
     * Creates a new `QC Flag Types Model` instance.
     *
     * @param {Model} model the global model
     * @returns {undefined}
     */
    constructor(model) {
        super();
        this.model = model;

        // Overview
        this._overviewModel = new QCFlagTypesOverviewModel();
        this._overviewModel.bubbleTo(this);
    }

    /**
     * Loads QC Flag Types overview data
     * @return {void}
     */
    loadOverview() {
        this._overviewModel.load();
    }

    /**
     * Returns the overview sub-model
     *
     * @return {QCFlagTypesOverviewModel} the overview sub-model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Load creation model
     * @return {void}
     */
    loadCreation() {
        this._creationModel = new QCFlagTypeCreationModel(() => this.model.router.go('/?page=qc-flag-types-overview'));
        this._creationModel.bubbleTo(this);
    }

    /**
     * Returns the creation sub-model
     *
     * @return {QCFlagTypeCreationModel} the creation sub-model
     */
    get creationModel() {
        return this._creationModel;
    }
}
