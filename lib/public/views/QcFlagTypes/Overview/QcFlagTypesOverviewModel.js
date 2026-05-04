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
import { buildUrl } from '/js/src/index.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';
import { RadioButtonFilterModel } from '../../../components/Filters/common/RadioButtonFilterModel.js';

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
            bad: new RadioButtonFilterModel([{ label: 'Any' }, { label: 'Bad', value: true }, { label: 'Not Bad', value: false }]),
        });

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
        return buildUrl('/api/qcFlagTypes', { filter: this._filteringModel.normalized });
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
     * States whether any filter is active
     *
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
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
}
