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
export class QcFlagsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
        this._run$ = new ObservableData(RemoteData.notAsked());
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._dplDetector$ = ObservableData.builder()
            .initialValue(RemoteData.notAsked())
            .source(detectorsProvider.physical$)
            .apply((remoteData) => remoteData.apply({
                Success: (detectors) => detectors.find(({ id }) => id === this._dplDetectorId),
            }));
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
                dplDetectorIds: [this._dplDetectorId],
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
        super.load();
    }

    /**
     * Fetch run data
     * @return {Promise<void>} promise
     */
    async _fetchRun() {
        this._run$.setCurrent(RemoteData.loading());
        try {
            const { data: run } = await getRemoteData(`/api/runs/${this._runNumber}`);
            this._run$.setCurrent(RemoteData.success(run));
        } catch (error) {
            this._run$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch data pass data
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._dataPass$.setCurrent(RemoteData.loading());
        try {
            const { data: [dataPass] } = await getRemoteData(`/api/dataPasses/?filter[ids][]=${this._dataPassId}`);
            this._dataPass$.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._dataPass$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Set id of detector which for flags should be fetched
     * @param {number} detectorId detector id
     */
    set detectorId(detectorId) {
        this._dplDetectorId = detectorId;
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
     * @return {RemoteData<Run>} current run
     */
    get run() {
        return this._run$.getCurrent();
    }

    /**
     * Data Pass getter
     * @return {RemoteData<DataPass>} current data pass
     */
    get dataPass() {
        return this._dataPass$.getCurrent();
    }

    /**
     * Detector getter
     * @return {RemoteData<DplDetector>} current detector
     */
    get dplDetector() {
        return this._dplDetector$.getCurrent();
    }
}
