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

/**
 * Simulation Passes Per LHC Period overview model
 */
export class SimulationPassesPerLhcPeriodOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor() {
        super();

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);

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
    getRootEndpoint() {
        const params = {
            filter: {
                names: this._namesFilterModel.normalized,
                lhcPeriodIds: [this._lhcPeriodId],
            },
        };

        return buildUrl('/api/simulationPasses', params);
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._namesFilterModel.reset();
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
     * Returns simulation passes names filter model
     * @return {TextTokensFilterModel} simulation passes names filter model
     */
    get namesFilterModel() {
        return this._namesFilterModel;
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
        return !this._namesFilterModel.isEmpty();
    }
}
