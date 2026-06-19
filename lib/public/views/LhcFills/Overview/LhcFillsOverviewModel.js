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

import { RawTextFilterModel } from '../../../components/Filters/common/filters/RawTextFilterModel.js';
import { addStatisticsToLhcFill } from '../../../services/lhcFill/addStatisticsToLhcFill.js';
import { BeamTypeFilterModel } from '../../../components/Filters/LhcFillsFilter/BeamTypeFilterModel.js';
import { TextComparisonFilterModel } from '../../../components/Filters/common/filters/TextComparisonFilterModel.js';
import { TimeRangeFilterModel } from '../../../components/Filters/RunsFilter/TimeRangeFilter.js';
import { ToggleFilterModel } from '../../../components/Filters/common/filters/ToggleFilterModel.js';
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';

/**
 * Model for the LHC fills overview page
 *
 * @implements {OverviewModel}
 */
export class LhcFillsOverviewModel extends FilterableOverviewPageModel {
    /**
     * Constructor
     *
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {boolean} [stableBeamsOnly=false] if true, overview will load stable beam only
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, stableBeamsOnly = false, pageIdentifier) {
        super(
            router,
            pageIdentifier,
            {
                fillNumbers: new RawTextFilterModel(),
                beamDuration: new TextComparisonFilterModel(),
                runDuration: new TextComparisonFilterModel(),
                hasStableBeams: new ToggleFilterModel(stableBeamsOnly, true),
                stableBeamsStart: new TimeRangeFilterModel(),
                stableBeamsEnd: new TimeRangeFilterModel(),
                beamTypes: new BeamTypeFilterModel(),
                schemeName: new RawTextFilterModel(),
            },
        );
    }

    /**
     * @inheritDoc
     */
    processItems(items) {
        for (const item of items) {
            addStatisticsToLhcFill(item);
        }
        return items;
    }

    /**
     * @inheritDoc
     */
    getRootEndpoint() {
        return this.buildRootEndpoint('/api/lhcFills');
    }
}
