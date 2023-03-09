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
import { LhcFillDetailsModel } from './Detail/LhcFillDetailsModel.js';
import { LhcFillsOverviewModel } from './Overview/LhcFillsOverviewModel.js';

/**
 * Model representing handlers for LhcFills (lhcFills)
 */
export default class LhcFills extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;

        // Sub-models
        this._overviewModel = new LhcFillsOverviewModel();
        this._overviewModel.bubbleTo(this);

        this._detailsModel = new LhcFillDetailsModel();
        this._detailsModel.bubbleTo(this);
    }

    /**
     * Retrieve every relevant LHC fill from the API
     *
     * @returns {void}
     */
    loadOverview() {
        this._overviewModel.fetchAllLhcFills();
    }

    /**
     * Clear all LhcFills variables to their defaults.
     * @returns {undefined}
     */
    clearOverview() {
        this._overviewModel.reset();
    }

    /**
     * Load the LHC fill details model for the given fill id
     *
     * @param {number} lhcFillNumber the number of the fill for which model details must be instantiated
     *
     * @return {void}
     */
    loadDetails(lhcFillNumber) {
        this._detailsModel.lhcFillNumber = lhcFillNumber;
    }

    /**
     * Clear the details model
     *
     * @return {void}
     */
    clearDetails() {
        this._detailsModel.lhcFillNumber = null;
    }

    /**
     * Returns the model for the overview page
     *
     * @return {LhcFillsOverviewModel} the overview model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Returns the model for the details page
     *
     * @return {LhcFillDetailsModel} the details model
     */
    get detailsModel() {
        return this._detailsModel;
    }
}
