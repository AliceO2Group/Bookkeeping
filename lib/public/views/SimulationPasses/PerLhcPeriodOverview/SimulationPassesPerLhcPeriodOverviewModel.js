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
import { RemoteData } from '/js/src/index.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { FilterableOverviewPageModel } from '../../../models/FilterableOverviewPageModel.js';

/**
 * Simulation Passes Per LHC Period overview model
 */
export class SimulationPassesPerLhcPeriodOverviewModel extends FilterableOverviewPageModel {
    /**
     * Constructor
     * @param {QueryRouter} router router that controls the application's page navigation
     * @param {string} pageIdentifier string that indicates what page this model represents
     */
    constructor(router, pageIdentifier) {
        super(router, pageIdentifier, { names: new TextTokensFilterModel() });

        this._lhcPeriod = new ObservableData(RemoteData.notAsked());
        this._lhcPeriod.bubbleTo(this);

        this._lhcPeriodId = null;
    }

    /**
     * Fetch LHC Period data which simulation passes are fetched
     * @return {Promise<void>} promise
     */
    async _fetchLhcPeriod() {
        this._lhcPeriod.setCurrent(RemoteData.loading());
        try {
            const { data: lhcPeriodStatistics } = await getRemoteData(`/api/lhcPeriodsStatistics/${this._lhcPeriodId}`);
            this._lhcPeriod.setCurrent(RemoteData.success(lhcPeriodStatistics.lhcPeriod));
        } catch (error) {
            this._lhcPeriod.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * @inheritdoc
     */
    async load() {
        this._fetchLhcPeriod();
        super.load();
    }

    /**
     * @inheritdoc
     */
    getFilterParams() {
        return { ...super.getFilterParams(), lhcPeriodIds: [this._lhcPeriodId] };
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return this.buildRootEndpoint('/api/simulationPasses');
    }

    /**
     * Set id of LHC Period which simulation passes are to be fetched
     * @param {number} lhcPeriodId id of LHC Period
     */
    set lhcPeriodId(lhcPeriodId) {
        this._lhcPeriodId = lhcPeriodId;
    }

    /**
     * Get current lhc period which simulation passes are fetched
     */
    get lhcPeriod() {
        return this._lhcPeriod.getCurrent();
    }
}
