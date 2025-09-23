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
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
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
        detectorsProvider.qc$.observe(() => this._getDetector());
        this._detector$ = new ObservableData(RemoteData.notAsked());
        this._detector$.bubbleTo(this);

        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);
    }

    /**
     * @inheritdoc
     */
    async load() {
        this._getDetector();
        this._fetchRun();
        super.load();
    }

    /**
     * @inheritdoc
     */
    getLoadParameters() {
        return {};
    }

    /**
     * Fetch detector which QC flags should be fetched
     * @return {void}
     */
    _getDetector() {
        this._detector$.setCurrent(detectorsProvider.qc$.getCurrent().match({
            Success: (detectors) => {
                const detector = detectors.find(({ id }) => id === this._detectorId);
                return detector
                    ? RemoteData.success(detector)
                    : RemoteData.failure({ errors: [{ detail: `There is no detector with given id (${this._detectorId})` }] });
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
     * @return {RemoteData<Detector>} current detector
     */
    get detector() {
        return this._detector$.getCurrent();
    }

    /**
     * Run getter
     * @return {RemoteData<Run>} current run
     */
    get run() {
        return this._run$.getCurrent();
    }

    /**
     * Detector id getter
     * @return {number} current detector id
     */
    get detectorId() {
        return this._detectorId;
    }

    /**
     * Set id of detector which for QC flags should be fetched
     * @param {number} detectorId detector id
     */
    set detectorId(detectorId) {
        this._detectorId = detectorId;
    }
}
