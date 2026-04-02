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
import { buildUrl, RemoteData } from '/js/src/index.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { FilteringModel } from '../../../components/Filters/common/FilteringModel.js';

/**
 * Simulation Passes Per Data Pass overview model
 */
export class AnchoredSimulationPassesOverviewModel extends OverviewPageModel {
    /**
     * Constructor
     */
    constructor(router) {
        super();

        this._filteringModel = new FilteringModel(router, ['anchored-simulation-passes-overview'], { names: new TextTokensFilterModel() });

        this._filteringModel.observe(() => {
            this._pagination.silentlySetCurrentPage(1);
            this.load();
        });

        this._filteringModel.visualChange$.bubbleTo(this);

        this._dataPass = new ObservableData(RemoteData.notAsked());
    }

    /**
     * Fetch data pass info which simulation passes are fetched
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._dataPass.setCurrent(RemoteData.loading());
        try {
            const { data: [dataPass] } = await getRemoteData(`/api/dataPasses/?filter[ids][]=${this._dataPassId}`);
            this._dataPass.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._dataPass.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * @inheritdoc
     */
    async load() {
        this._fetchDataPass();
        super.load();
    }

    /**
     * @inheritdoc
     * @override
     */
    getRootEndpoint() {
        const filter = { ...this._filteringModel.normalized, dataPassIds: [this._dataPassId] };
        return buildUrl('/api/simulationPasses', { filter });
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
     * Return the model managing all filters
     *
     * @return {FilteringModel} the filtering model
     */
    get filteringModel() {
        return this._filteringModel;
    }

    /**
     * Set id of current data pass which simulation passes are fetched
     * @param {number} dataPassId data pass id
     */
    set dataPassId(dataPassId) {
        this._dataPassId = dataPassId;
    }

    /**
     * Get current data pass which simulation passes are fetched
     */
    get dataPass() {
        return this._dataPass.getCurrent();
    }

    /**
     * States whether any filter is active
     * @return {boolean} true if any filter is active
     */
    isAnyFilterActive() {
        return this._filteringModel.isAnyFilterActive();
    }
}
