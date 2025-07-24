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
import { NON_PHYSICS_PRODUCTIONS_NAMES_WORDS, NonPhysicsProductionsNamesWords } from '../../../domain/enums/NonPhysicsProductionsNamesWords.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { SortModel } from '../../components/common/table/SortModel.js';

/**
 * Data Passes Per LHC Period overview model
 */
export class DataPassesOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._sortModel = new SortModel();
        this._sortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });

        this._sortModel.visualChange$.bubbleTo(this);

        this._filteringModel = new FilteringModel({
            names: new TextTokensFilterModel(),
            nonPhysics: new SelectionFilterModel({
                availableOptions: NON_PHYSICS_PRODUCTIONS_NAMES_WORDS.map((word) => ({ label: word.toUpperCase(), value: word })),
            }),
        });

        this._filteringModel.visualChange$.bubbleTo(this);
        this._filteringModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
    }

    /**
     * Return filters and sort params of base model
     *
     * @return {{ filter: object, sort: object }} filters and sort params
     */
    getBaseParams() {
        const nonPhysicsSelectionModel = this._filteringModel.get('nonPhysics').selectionModel;
        const filter = {
            names: this._filteringModel.get('names').normalized,
            includeTest: nonPhysicsSelectionModel.selected.includes(NonPhysicsProductionsNamesWords.TEST),
            includeDebug: nonPhysicsSelectionModel.selected.includes(NonPhysicsProductionsNamesWords.DEBUG),
        };

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._sortModel;
        const sortParams = {};
        if (sortOn && sortDirection) {
            sortParams[`sort[${sortOn}]`] = sortDirection;
        }

        return { filter, sort: sortParams };
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
