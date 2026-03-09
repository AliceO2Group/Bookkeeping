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

import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { SelectionModel } from '../../../components/common/selection/SelectionModel.js';
import { buildUrl } from '/js/src/index.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';

/**
 * QcFlagTypesOverviewModel
 */
export class QcFlagTypesOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._filteringModel = new FilteringModel({
            names: new TextTokensFilterModel(),
            methods: new TextTokensFilterModel(),
        });

        this._isBadFilterModel =
            new SelectionModel({ availableOptions: [{ label: 'Bad', value: true }, { label: 'Not Bad', value: false }] });
        this._registerFilter(this._isBadFilterModel);

        this._filteringModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });

        this._filteringModel.visualChange$.bubbleTo(this);
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {};
        if (this.isAnyFilterActive()) {
            params.filter = {
                names: this._filteringModel.get("names").normalized,
                methods: this._filteringModel.get("methods").normalized,
                bad: this._isBadFilterModel.selected.length === 2
                    ? undefined
                    : this._isBadFilterModel.selected[0],
            };
        }

        return buildUrl('/api/qcFlagTypes', params);
    }

    /**
     * Return the model managing all filters
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
    }

    /**
     * Returns filter model for filtering bad and not bad flags
     *
     * @return {TextTokensFilterModel} filter model for filtering bad and not bad flags
     */
    get isBadFilterModel() {
        return this._isBadFilterModel;
    }

    /**
     * Register a new filter model
     *
     * @param {FilterModel} filterModel the filter model to register
     * @return {void}
     * @private
     */
    _registerFilter(filterModel) {
        filterModel.visualChange$.bubbleTo(this);
        filterModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
    }

    /**
     * States whether any filter is active
     *
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive() || this._isBadFilterModel.selected.length;
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._filteringModel.reset();
        this._isBadFilterModel.reset();
        super.reset();
    }
}
