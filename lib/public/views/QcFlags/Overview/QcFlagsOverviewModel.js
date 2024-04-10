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
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

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
        dplDetectorsProvider.bubbleTo(this);
        this._dplDetector$ = new ObservableData(RemoteData.notAsked());
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
        this._fetchDetector();
        this._fetchRun();
        super.load();
    }

    /**
     * Fetch DPL detector which QC flags should be fetched
     * @return {void}
     */
    _fetchDetector() {
        this._dplDetector$.setCurrent(dplDetectorsProvider.physical$.getCurrent().apply({
            Success: (detectors) => detectors.find(({ id }) => id === this._dplDetectorId),
        }));
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
     * Set id of DPL detector which for QC flags should be fetched
     * @param {number} dplDetectorId detector id
     */
    set dplDetectorId(dplDetectorId) {
        this._dplDetectorId = dplDetectorId;
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
     * Detector getter
     * @return {RemoteData<DplDetector>} current detector
     */
    get dplDetector() {
        return this._dplDetector$.getCurrent();
    }
}
