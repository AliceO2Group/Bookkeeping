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
import { EnvironmentOverviewModel } from './Overview/EnvironmentOverviewModel.js';
import { EnvironmentDetailsModel } from './Details/EnvironmentDetailsModel.js';

/**
 * Model representing handlers for Environments (envs)
 *
 * @implements {OverviewModel}
 */
export class EnvironmentModel extends Observable {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();

        // Sub-models
        this._overviewModel = new EnvironmentOverviewModel();
        this._overviewModel.bubbleTo(this);

        this._detailsModel = new EnvironmentDetailsModel();
        this._detailsModel.bubbleTo(this);
    }

    /**
     * Load the overview page state
     * @return {void} resolves once the loading is complete
     */
    loadOverview() {
        this._overviewModel.fetchAllEnvs();
    }

    /**
     * Clear the overview page state
     *
     * @return {void} resolves once the clear is complete
     */
    clearOverview() {
        this._overviewModel.reset();
    }

    /**
     * Load the detail page state for a given environment
     *
     * @param {string} environmentId the id of the environment to load
     * @return {void}
     */
    loadDetails(environmentId) {
        this._detailsModel.environmentId = environmentId;
    }

    /**
     * Returns the overview model
     *
     * @return {EnvironmentOverviewModel} the overview model
     */
    get overviewModel() {
        return this._overviewModel;
    }

    /**
     * Returns the details model
     *
     * @return {EnvironmentDetailsModel} the details model
     */
    get detailsModel() {
        return this._detailsModel;
    }
}
