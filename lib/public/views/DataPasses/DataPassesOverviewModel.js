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
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { SelectionFilterModel } from '../../../components/Filters/common/filters/SelectionFilterModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { NON_PHYSICS_PRODUCTIONS_NAMES_WORDS } from '../../../domain/enums/NonPhysicsProductionsNamesWords.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';

/**
 * Data Passes overview model
 */
export class DataPassesOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._filteringModel = new FilteringModel({
            names: new TextTokensFilterModel(),
            'include[byName]': new SelectionFilterModel({
                availableOptions: NON_PHYSICS_PRODUCTIONS_NAMES_WORDS.map((word) => ({ label: word.toUpperCase(), value: word })),
            }),
        });

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
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._filteringModel.reset();
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
