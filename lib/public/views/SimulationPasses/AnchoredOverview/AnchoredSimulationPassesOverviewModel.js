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
import { RemoteData } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { SortModel } from '../../../components/common/table/SortModel.js';
import { TextTokensFilterModel } from '../../../components/Filters/common/filters/TextTokensFilterModel.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../../utilities/ObservableData.js';

/**
 * Simulation Passes Per Data Pass overview model
 */
export class AnchoredSimulationPassesOverviewModel extends OverviewPageModel {
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

        this._namesFilterModel = new TextTokensFilterModel();
        this._registerFilter(this._namesFilterModel);

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

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._fetchDataPass();
        super.load();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                names: this._namesFilterModel.normalized,
                dataPassIds: [this._dataPassId],
            },
        };

        const { appliedOn: sortOn, appliedDirection: sortDirection } = this._sortModel;
        if (sortOn && sortDirection) {
            params[`sort[${sortOn}]`] = sortDirection;
        }

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
     * Returns the model handling the overview page table sort
     *
     * @return {SortModel} the sort model
     */
    get sortModel() {
        return this._sortModel;
    }

    /**
     * Returns data passes names filter model
     * @return {TextTokensFilterModel} data passes names filter model
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
