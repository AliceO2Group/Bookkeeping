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
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { RunsOverviewModel } from '../Overview/RunsOverviewModel.js';

/**
 * Runs Per Data Pass overview model
 */
export class RunsPerDataPassOverviewModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._detectors = RemoteData.notAsked();
    }

    /**
     * Retrieve a list of detector types from detectorsProvider
     *
     * @return {Promise<void>} resolves once the data has been fetched
     */
    async fetchDetectors() {
        this._detectors = RemoteData.loading();
        this.notify();

        try {
            const detectors = await detectorsProvider.getAll();
            this._detectors = RemoteData.success(detectors);
        } catch (error) {
            this._detectors = RemoteData.failure(error);
        }

        this.notify();
    }

    /**
     * Retrieve every relevant run from the API
     * Relevant runs are of `PHYSICS` definition, `GOOD` quality, belonging to given data pass
     * @param {object} params fetch params
     * @param {string} [params.dataPassName] data pass name which runs should be fetched
     * @return {void}
     */
    async fetchRuns({ dataPassName } = {}) {
        this._dataPassName = dataPassName || this._dataPassName;
        if (!this._dataPassName) {
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
                dataPassNames: this._dataPassName,
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
     * Get name of current data pass which runs are fetched
     */
    get dataPassName() {
        return this._dataPassName;
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
        return this._detectors;
    }
}
