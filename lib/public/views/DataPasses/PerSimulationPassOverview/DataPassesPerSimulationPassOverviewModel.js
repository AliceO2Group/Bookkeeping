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
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../../utilities/ObservableData.js';

/**
 * Data Passes Per Simulation Pass overview model
 */
export class DataPassesPerSimulationPassOverviewModel extends OverviewPageModel {
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

        this._nameFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._nameFilterModel);
        this._simulationPass = new ObservableData(RemoteData.notAsked());
        this._simulationPass.bubbleTo(this);
    }

    /**
     * Fetch Simulaiton Pass data which data passes are fetched
     * @return {Promise<void>} promise
     */
    async _fetchSimulationPass() {
        this._simulationPass.setCurrent(RemoteData.loading());
        try {
            const { data: simulationPass } = await getRemoteData(`/api/simulationPasses/${this._simulationPassId}`);
            this._simulationPass.setCurrent(RemoteData.success(simulationPass));
        } catch (error) {
            this._simulationPass.setCurrent(RemoteData.failure(error));
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._fetchSimulationPass();
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                names: this._nameFilterModel.normalized,
                simulationPassIds: [this._simulationPassId],
            },
        };

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._sortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }

        return buildUrl('/api/dataPasses', params);
    }

    /**
     * Set id of current simulation pass which data passes are fetched
     * @param {number} simulationPassId simulation pass id
     */
    set simulationPassId(simulationPassId) {
        this._simulationPassId = simulationPassId;
    }

    /**
     * Reset this model to its default
     *
     * @returns {void}
     */
    reset() {
        this._nameFilterModel.reset();
        super.reset();
    }

    /**
     * Get current simulation pass which data passes are fetched
     */
    get simulationPass() {
        return this._simulationPass.getCurrent();
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
     * Returns data pass name filter model
     * @return {TextTokensFilterModel} data pass name filter model
     */
    get nameFilterModel() {
        return this._nameFilterModel;
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
        return !this._nameFilterModel.isEmpty();
    }
}
