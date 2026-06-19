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
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';

/**
 * LHC Periods overview model
 *
 * @implements {OverviewModel}
 */
export class LhcPeriodsOverviewModel extends FilterableOverviewPageModel {
    /**
     * The constructor of the Overview model object
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, pageIdentifier) {
        super(
            router,
            pageIdentifier,
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
        return this.buildRootEndpoint('/api/lhcPeriodsStatistics');
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
}
