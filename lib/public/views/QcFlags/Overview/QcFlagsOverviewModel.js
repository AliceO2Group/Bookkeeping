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
 * @abstract
 */
export class QcFlagsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();
        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);
        this._dataProduction$ = new ObservableData(RemoteData.notAsked());
        this._dataProduction$.bubbleTo(this);
        this._dplDetector$ = ObservableData.builder()
            .initialValue(RemoteData.notAsked())
            .source(detectorsProvider.dpl$)
            .apply((remoteData) => remoteData.apply({
                Success: (detectors) => detectors.find(({ id }) => id === this._dplDetectorId),
            }))
            .build();
        this._dplDetector$.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const params = {
            filter: {
                runNumbers: [this._runNumber],
                dplDetectorIds: [this._dplDetectorId],
            },
        };

        return buildUrl('/api/qcFlags', params);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._fetchRun();
        this._fetchDataProduction();
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
     * Fetch data production data
     * @return {Promise<void>} promise
     * @abstract
     */
    async _fetchDataProduction() {
        throw new Error('Abstract function call');
    }

    /**
     * Set id of DPL detector which for QC flags should be fetched
     * @param {number} dplDetectorId detector id
     */
    set dplDetectorId(dplDetectorId) {
        this._dplDetectorId = dplDetectorId;
    }

    /**
     * Set id of data production which for QC flags should be fetched
     * @param {number} dataProducationId data pass id
     */
    set dataProductionId(dataProducationId) {
        this._dataProductionId = dataProducationId;
    }

    /**
     * Set runNumber of run which for QC flags should be fetched
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
     * Data Production getter
     * @return {RemoteData<DataPass|SimulationPass>} current data pass
     */
    get dataProduction() {
        return this._dataProduction$.getCurrent();
    }

    /**
     * Detector getter
     * @return {RemoteData<DplDetector>} current detector
     */
    get dplDetector() {
        return this._dplDetector$.getCurrent();
    }
}
