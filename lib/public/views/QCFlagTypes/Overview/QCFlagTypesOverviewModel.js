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
import { SortModel } from '../../../components/common/table/SortModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { SelectionModel } from '../../../components/common/selection/SelectionModel.js';

/**
 * QCFlagTypesOverviewModel
 */
export class QCFlagTypesOverviewModel extends OverviewPageModel {
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

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);
        this._methodsFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._methodsFilterModel);
        this._badnessFilterModel = new SelectionModel({ availableOptions: [{ label: 'Bad', value: true }, { label: 'Not Bad', value: false }] });
        this._registerFilter(this._badnessFilterModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {};
        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._sortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }
        if (this.isAnyFilterActive()) {
            params.filter = {
                names: { like: this._namesFilterModel.normalized },
                methods: { like: this._methodsFilterModel.normalized },
                bad: this._badnessFilterModel.selected.length === 2
                    ? undefined
                    : this._badnessFilterModel.selected[0],
            };
        }

        return buildUrl('/api/qualityControlFlags/types', params);
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get sortModel() {
        return this._sortModel;
    }

    /**
     * Returns QC Flag Types names filter model
     * @return {TextTokensFilterModel} QC Flag Types names filter model
     */
    get namesFilterModel() {
        return this._namesFilterModel;
    }

    /**
     * Returns QC Flag Types methods filter model
     * @return {TextTokensFilterModel} QC Flag Types methods filter model
     */
    get methodsFilterModel() {
        return this._methodsFilterModel;
    }

    /**
     * Returns QC Flag Types badness filter model
     * @return {TextTokensFilterModel} QC Flag Types badness filter model
     */
    get badnessFilterModel() {
        return this._badnessFilterModel;
    }

    /**
     * Register a new filter model
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
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return !this._namesFilterModel.isEmpty() || !this._methodsFilterModel.isEmpty() || this._badnessFilterModel.selected.length;
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._methodsFilterModel.reset();
        this._namesFilterModel.reset();
        super.reset();
    }
}