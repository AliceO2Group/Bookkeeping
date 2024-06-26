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

import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { RemoteData } from '/js/src/index.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';

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
        dplDetectorsProvider.physical$.observe(() => this._getDetector());
        this._dplDetector$ = new ObservableData(RemoteData.notAsked());
        this._dplDetector$.bubbleTo(this);

        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritdoc
     */
    async load() {
        this._getDetector();
        this._fetchRun();
        super.load();
    }

    /**
     * Fetch DPL detector which QC flags should be fetched
     * @return {void}
     */
    _getDetector() {
        this._dplDetector$.setCurrent(dplDetectorsProvider.physical$.getCurrent().match({
            Success: (dplDetectors) => {
                const dplDetector = dplDetectors.find(({ id }) => id === this._dplDetectorId);
                return dplDetector
                    ? RemoteData.success(dplDetector)
                    : RemoteData.failure({ errors: [{ detail: `There is no dplDetector with given id (${this._dplDetectorId})` }] });
            },
            Failure: (payload) => RemoteData.failure(payload),
            Loading: () => RemoteData.loading(),
            NotAsked: () => RemoteData.notAsked(),
        }));
    }

    /**
     * Fetch Run data which QC flags are fetched
     * @return {Promise<void>} promise
     * @private
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
     * Run number getter
     * @return {number} current run number
     */
    get runNumber() {
        return this._runNumber;
    }

    /**
     * Set runNumber of run which for QC flags should be fetched
     * @param {number} runNumber runNumber
     */
    set runNumber(runNumber) {
        this._runNumber = runNumber;
    }

    /**
     * Detector getter
     * @return {RemoteData<DplDetector>} current detector
     */
    get dplDetector() {
        return this._dplDetector$.getCurrent();
    }

    /**
     * Run getter
     * @return {RemoteData<Run>} current run
     */
    get run() {
        return this._run$.getCurrent();
    }

    /**
     * DplDetector id getter
     * @return {number} current dpl detector id
     */
    get dplDetectorId() {
        return this._dplDetectorId;
    }

    /**
     * Set id of DPL detector which for QC flags should be fetched
     * @param {number} dplDetectorId detector id
     */
    set dplDetectorId(dplDetectorId) {
        this._dplDetectorId = dplDetectorId;
    }
}
