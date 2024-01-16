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

import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';

/**
 * LHC Periods overview model
 *
 * @implements {OverviewModel}
 */
export class LhcPeriodsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();

        this._overviewSortModel = new SortModel();
        this._overviewSortModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
        this._overviewSortModel.visualChange$.bubbleTo(this);

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);
        this._yearsFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._yearsFilterModel);
        this._beamTypesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._beamTypesFilterModel);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                names: this._namesFilterModel.normalized,
                years: this._yearsFilterModel.normalized,
                beamTypes: this._beamTypesFilterModel.normalized,
            },
        };

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._overviewSortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }

        return buildUrl('/api/lhcPeriodsStatistics', params);
    }

    /**
     * Flatten lhc periods with statistics object
     * @param {LhcPeriodStatistics[]} lhcPeriods data
     * @returns {{LhcPeriodStatistics+LhcPeriod}[]} lhc period statistics and lhc period properties in single object
     */
    processItems(lhcPeriods) {
        return lhcPeriods.map((lhcPeriodData) => {
            const { lhcPeriod } = lhcPeriodData;
            delete lhcPeriodData.lhcPeriod;
            return {
                ...lhcPeriod,
                ...lhcPeriodData,
            };
        });
    }

    /**
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get overviewSortModel() {
        return this._overviewSortModel;
    }

    /**
     * Returns lhc periods names filter model
     * @return {TextTokensFilterModel} lhc periods names filter model
     */
    get namesFilterModel() {
        return this._namesFilterModel;
    }

    /**
     * Returns lhc periods years filter model
     * @return {TextTokensFilterModel} lhc periods years filter model
     */
    get yearsFilterModel() {
        return this._yearsFilterModel;
    }

    /**
     * Returns lhc periods beam type filter model
     * @return {TextTokensFilterModel} lhc periods beam type filter model
     */
    get beamTypesFilterModel() {
        return this._beamTypesFilterModel;
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        super.reset();
        this._namesFilterModel.reset();
        this._yearsFilterModel.reset();
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
        return !this._namesFilterModel.isEmpty() || !this._yearsFilterModel.isEmpty();
    }
}
