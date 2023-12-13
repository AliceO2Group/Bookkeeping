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
import { RemoteData } from '/js/src/index.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { createDetectorsProviderInstance } from '../../../services/detectors/detectorsProvider.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';

/**
 * Runs Per LHC Period overview model
 */
export class RunsPerLhcPeriodOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._detectorsProvider = createDetectorsProviderInstance();
    }

    /**
     * Retrieve a list of detector types from detectorsProvider
     *
     * @return {Promise<void>} resolves once the data has been fetched
     */
    async fetchDetectors() {
        this._detectorsProvider.fetch();
    }

    /**
     * Retrieve every relevant run from the API
     * Relevant runs are of `PHYSICS` definition, `GOOD` quality, belonging to given LHC Period
     * @param {object} params fetch params
     * @param {string} [params.lhcPeriodName] lhc period name which runs should be fetched
     * @return {void}
     */
    async fetchRuns({ lhcPeriodName } = {}) {
        this._lhcPeriodName = lhcPeriodName || this._lhcPeriodName;
        if (!this._lhcPeriodName) {
            return;
        }

        const params = {
            page: {
                offset: this._pagination.firstItemOffset,
                limit: this._pagination.itemsPerPage,
            },
            filter: {
                runQualities: 'good',
                definitions: 'PHYSICS',
                lhcPeriods: this._lhcPeriodName,
            },
        };

        // TODO be replace with RemoteDataSource and observable pipes
        const endpoint = buildUrl('/api/runs', params);
        try {
            this._runs = RemoteData.loading();
            const { items, totalCount } = await getRemoteDataSlice(endpoint);
            this._runs = RemoteData.success(items);

            this._pagination.itemsCount = totalCount;
        } catch (errors) {
            this._runs = RemoteData.failure(errors);
        }

        this.notify();
    }

    /**
     * Get current name of lhc period which runs are fetched
     */
    get lhcPeriodName() {
        return this._lhcPeriodName;
    }

    /**
     * Returns fetched runs
     *
     * @return {RemoteData} the runs in the current page if all other neccessary data are succesfuly fetched
     */
    get runs() {
        return this._runs;
    }

    /**
     * Get all detectors
     * @return {RemoteData<Detector[]>} detectors
     */
    get detectors() {
        return this._detectorsProvider.detectors;
    }
}
