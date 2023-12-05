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
import RunsModel from '../Runs.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { RemoteDataFetcher } from '../../../utilities/fetch/RemoteDataFetcher.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

/**
 * Runs Per Period overview model
 */
export class RunsPeriodPeriodOverviewModel extends RunsModel {
    /**
     * Constructor
     * @param {Model} model Pass the model to access the defined functions
     */
    constructor(model) {
        super(model);

        this._remoteDataFetcher = new RemoteDataFetcher();
        this._remoteDataFetcher.bubbleTo(this);
        this._detectorsProvider = detectorsProvider;
        this._detectorsProvider.getAll();
        // eslint-disable-next-line no-return-assign
        // TODO this._remoteDataFetcher.observe(() => this._pagination.itemsCount = this._remoteDataFetcher.totalCount);
    }

    /**
     * Retrieve every relevant run from the API
     * Relevant runs are of `PHYSICS` definition, `GOOD` quality ones belonging to given LHC Period
     * @param {object} params model params
     * @param {string} [params.lhcPeriodName] lhc period name which runs should be fetched
     * @return {void}
     */
    async fetchAllRuns({ lhcPeriodName } = {}) {
        this._lhcPeriodName = lhcPeriodName || this._lhcPeriodName;
        if (!this._lhcPeriodName) {
            throw new Error('LHC Period name is not specified');
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

        const endpoint = buildUrl('/api/runs', params);
        await this._remoteDataFetcher.fetch(endpoint);
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
     * @return {RemoteData} the runs in the current page
     */
    get runs() {
        return this._remoteDataFetcher.data;
    }

    /**
     * Get all detectors
     * @return {{id: number, name: string}[]} detectors
     */
    get detectors() {
        return this._detectorsProvider.detectors;
    }
}
