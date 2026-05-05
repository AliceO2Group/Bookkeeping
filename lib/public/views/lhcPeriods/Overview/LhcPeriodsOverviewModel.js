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
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { buildUrl } from '/js/src/index.js';

/**
 * LHC Periods overview model
 *
 * @implements {OverviewModel}
 */
export class LhcPeriodsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, pageIdentifier) {
        super();

        this._filteringModel = new FilteringModel(
            router,
            {
                names: new TextTokensFilterModel(),
                years: new TextTokensFilterModel(),
                pdpBeamTypes: new TextTokensFilterModel(),
            },
        );

        this._filteringModel.pageIdentifier = pageIdentifier;
        this._filteringModel.visualChange$.bubbleTo(this);
        this._filteringModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl('/api/lhcPeriodsStatistics', { filter: this._filteringModel.normalized });
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
     * Flatten lhc period statistics objects
     * @param {LhcPeriodStatistics[]} lhcPeriods data
     * @returns {{LhcPeriodStatistics,LhcPeriod}[]} lhc period statistics and lhc period properties in single object
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
     * Reset this model to its default
     *
     * @param {boolean} _fetch Whether to refetch all data after filters have been reset
     * @param {boolean} [clearUrl=false] if true filters will be removed from the url
     * @return {void}
     */
    reset(_fetch = true, clearUrl = false) {
        super.reset();
        this._filteringModel.reset(false, clearUrl);
    }

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }
}
