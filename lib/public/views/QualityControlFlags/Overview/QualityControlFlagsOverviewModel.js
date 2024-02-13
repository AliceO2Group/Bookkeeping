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
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

/**
 * Quality Control Flags overview model
 *
 * @implements {OverviewModel}
 */
export class QualityControlFlagsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
        this._observableRun = new ObservableData(RemoteData.notAsked());
        this._observableDataPass = new ObservableData(RemoteData.notAsked());
        this._observableDetector = new ObservableData(RemoteData.notAsked());
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                runNumbers: [this._runNumber],
                dataPassIds: [this._dataPassId],
                detectorIds: [this._detectorId],
            },
        };

        return buildUrl('/api/qualityControlFlags', params);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._fetchRun();
        this._fetchDataPass();
        this._fetchDetector();
        super.load();
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchRun() {
        this._observableRun.setCurrent(RemoteData.loading());
        try {
            const { data: run } = await getRemoteData(`/api/runs/${this._runNumber}`);
            this._observableRun.setCurrent(RemoteData.success(run));
        } catch (error) {
            this._observableRun.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch detector data
     * @return {Promise<void>} promise
     */
    async _fetchDetector() {
        this._observableDetector.setCurrent(RemoteData.loading());
        try {
            const allDetectors = await detectorsProvider.getAll();
            const targetDetector = allDetectors.find(({ id }) => this._detectorId === id);
            if (!targetDetector) {
                throw new Error('Cannot fetch detectors');
            }
            this._observableDetector.setCurrent(RemoteData.success(targetDetector));
        } catch (error) {
            this._observableDetector.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch data pass data
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._observableDataPass.setCurrent(RemoteData.loading());
        try {
            const { data: [dataPass] } = await getRemoteData(`/api/dataPasses/?filter[ids][]=${this._dataPassId}`);
            this._observableDataPass.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._observableDataPass.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Set id of detector which for flags should be fetched
     * @param {number} detectorId detector id
     */
    set detectorId(detectorId) {
        this._detectorId = detectorId;
    }

    /**
     * Set id of data pass which for flags should be fetched
     * @param {number} dataPassId data pass id
     */
    set dataPassId(dataPassId) {
        this._dataPassId = dataPassId;
    }

    /**
     * Set runNumber of run which for flags should be fetched
     * @param {number} runNumber runNumber
     */
    set runNumber(runNumber) {
        this._runNumber = runNumber;
    }

    /**
     * Run getter
     * @return {Run} current run
     */
    get run() {
        return this._observableRun.getCurrent();
    }
}
