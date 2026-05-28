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
import { SelectionModel } from '../../components/common/selection/SelectionModel.js';
import { FilteringModel } from '../../components/Filters/common/FilteringModel.js';
import { TextTokensFilterModel } from '../../components/Filters/common/filters/TextTokensFilterModel.js';
import { NON_PHYSICS_PRODUCTIONS_NAMES_WORDS } from '../../domain/enums/NonPhysicsProductionsNamesWords.js';
import { OverviewPageModel } from '../../models/OverviewModel.js';

/**
 * Data Passes overview model
 */
export class DataPassesOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, pageIdentifier) {
        super();
        this._filteringModel = new FilteringModel(
            router,
            {
                names: new TextTokensFilterModel(),
                permittedNonPhysicsNames: new SelectionModel({
                    availableOptions: NON_PHYSICS_PRODUCTIONS_NAMES_WORDS.map((word) => ({ label: word.toUpperCase(), value: word })),
                }),
            },
        );

        this._filteringModel.pageIdentifier = pageIdentifier;
        this._filteringModel.setFilterFromURL();
        this._filteringModel.visualChange$.bubbleTo(this);
        this._filteringModel.observe(() => {
            this._pagination.currentPage = 1;
            this.load();
        });
    }

    /**
     * Return filter params of base model
     *
     * @return {object} filter
     */
    getFilterParams() {
        return this._filteringModel.normalized;
    }

    /**
     * Set underlying FilteringModel's filters from the query parameters in the URL
     * 
     * @param {boolean} notify if the FilteringModel should notify it's observers after finishing setting the filters
     */
    setFilterFromURL(notify) {
        this._filteringModel.setFilterFromURL(notify);        
    }

    /**
     * Reset this model to its default
     *
     * @param {boolean} _fetch Whether to refetch all data after filters have been reset
     * @param {boolean} [clearUrl=false] if true filters will be removed from the url
     * @return {void}
     */
    reset(_fetch = true, clearUrl = false) {
        this._filteringModel.reset(false, clearUrl);
        super.reset();
    }

    /**
     * Return the filtering model
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
    }
}
