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
import { buildUrl, RemoteData } from '/js/src/index.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';

/**
 * Simulation Passes Per LHC Period overview model
 */
export class SimulationPassesPerLhcPeriodOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor(router) {
        super();

        this._filteringModel = new FilteringModel(router, { names: new TextTokensFilterModel() });

        this._filteringModel.pageIdentifiers = ['simulation-passes-per-lhc-period-overview'];
        this._filteringModel.visualChange$.bubbleTo(this);
        this._filteringModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });

        this._lhcPeriod = new ObservableData(RemoteData.notAsked());
        this._lhcPeriod.bubbleTo(this);

        this._lhcPeriodId = null;
        this._filteringModel.setFilterFromURL();
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
     * Return the model managing all filters
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
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
     * @override
     */
    getRootEndpoint() {
        const filter = { ...this._filteringModel.normalized, lhcPeriodIds: [this._lhcPeriodId] };
        return buildUrl('/api/simulationPasses', { filter });
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset(resetUrl=false) {
        this._filteringModel.reset(false, resetUrl);
        super.reset();
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

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }
}
