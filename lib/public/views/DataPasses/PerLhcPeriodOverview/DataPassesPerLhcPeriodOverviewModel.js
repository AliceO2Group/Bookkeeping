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
 * Data Passes Per LHC Period overview model
 */
export class DataPassesPerLhcPeriodOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._filteringModel = new FilteringModel({
            names: new TextTokensFilterModel(),
        });

        this._filteringModel.visualChange$.bubbleTo(this);
        this._filteringModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });
    }

    /**
     * @inheritdoc
     */
    async load({ lhcPeriodId } = {}) {
        this._lhcPeriodId = lhcPeriodId ?? this._lhcPeriodId;
        super.load();
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                lhcPeriodIds: [this._lhcPeriodId],
                names: this._filteringModel.get('names').normalized,
            },
        };

        return buildUrl('/api/dataPasses', params);
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
     * Get id of current lhc period which data passes are fetched
     */
    get lhcPeriodId() {
        return this._lhcPeriodId;
    }

    /**
     * Return the filtering model
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
    }

    /**
     * Checks if any filter value has been modified from their default (empty)
     * @return {Boolean} If any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }
}
