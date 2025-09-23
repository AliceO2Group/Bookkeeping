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

import { buildUrl, RemoteData } from '/js/src/index.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { OverviewPageModel } from '../../../models/OverviewModel.js';
import { jsonPost } from '../../../utilities/fetch/jsonPost.js';
import { PhysicalDetectorPickerModel } from '../../../components/detector/PhysicalDetectorPickerModel.js';

/**
 * GAQ Flags overview model
 */
export class GaqFlagsOverviewModel extends OverviewPageModel {
    /**
     * The constructor of the Overview model object
     */
    constructor() {
        super();

        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._dataPass$.bubbleTo(this);
        this._gaqDetectors$ = new ObservableData(RemoteData.notAsked());
        this._gaqDetectors$.bubbleTo(this);
        this._gaqDetectorPickerModel = null;
        this._setGaqDetectorsRequestResult = new ObservableData(RemoteData.notAsked());
        this._setGaqDetectorsRequestResult.bubbleTo(this);
    }

    /**
     * Overrides base method setting pagination parameters
     * @return {object} empty object
     */
    getLoadParameters() {
        return {};
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        return buildUrl('/api/qcFlags/gaq', {
            dataPassId: this._dataPassId,
            runNumber: this._runNumber,
        });
    }

    /**
     * @inheritdoc
     */
    async load() {
        await this._fetchGaqDetectors();
        await this._fetchRun();

        this._gaqDetectors$.getCurrent().match({
            Success: (currentDetectors) => {
                this._run$.getCurrent().match({
                    Success: ({ detectors }) => {
                        this._gaqDetectorPickerModel = new PhysicalDetectorPickerModel({
                            defaultDetectors: currentDetectors,
                            allowedDetectorsNames: detectors.split(','),
                        });
                        this._gaqDetectorPickerModel.bubbleTo(this);
                    },
                    Other: () => {},
                });
            },
            Other: () => {},
        });

        this._fetchDataPass();
        super.load();
    }

    /**
     * Fetch GAQ detectors
     *
     * @return {Promise<void>} resolved once data are fetched
     */
    async _fetchGaqDetectors() {
        this._gaqDetectors$.setCurrent(RemoteData.loading());
        try {
            const { data: gaqDetectors } =
                await getRemoteData(`/api/gaqDetectors?dataPassId=${this._dataPassId}&runNumber=${this._runNumber}`);
            this._gaqDetectors$.setCurrent(RemoteData.success(gaqDetectors));
        } catch (error) {
            this._gaqDetectors$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch data pass data which QC flags are fetched
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
     * Submit request for changing set of GAQ detectors for given run and data pass
     * @returns {void}
     */
    async submitNewGaqDetectors() {
        this._setGaqDetectorsRequestResult.setCurrent(RemoteData.loading());

        try {
            await jsonPost('/api/gaqDetectors', {
                dataPassId: this._dataPassId,
                runNumbers: [this._runNumber],
                detectorIds: this._gaqDetectorPickerModel.selected,
            });

            this._setGaqDetectorsRequestResult.setCurrent(RemoteData.success(null));
            this.load();
        } catch (errors) {
            this._setGaqDetectorsRequestResult.setCurrent(RemoteData.failure(errors));
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
     * Run getter
     * @return {RemoteData<Run>} current run
     */
    get run() {
        return this._run$.getCurrent();
    }

    /**
     * Set id of data pass which for QC flags should be fetched
     * @param {number} dataPassId data pass id
     */
    set dataPassId(dataPassId) {
        this._dataPassId = dataPassId;
    }

    /**
     * Get current data pass which QC flags are fetched
     * @return {RemoteData<DataPass>} data pass remote data
     */
    get dataPass() {
        return this._dataPass$.getCurrent();
    }

    /**
     * Get list of DPL detectors which flags contributes to GAQ
     * @return {RemoteData<DplDetector[]>} dpl detectors remote data
     */
    get gaqDetectors() {
        return this._gaqDetectors$.getCurrent();
    }

    /**
     * Data pass id getter
     * @return {number} current data pass id
     */
    get dataPassId() {
        return this._dataPassId;
    }

    /**
     * Get Detectors picker model
     * @return {PhysicalDetectorPickerModel} picker model
     */
    get gaqDetectorPickerModel() {
        return this._gaqDetectorPickerModel;
    }

    /**
     * Result of request for changing set of GAQ detectors
     * @return {RemoteData} remote data
     */
    get setGaqDetectorsRequestResult() {
        return this._setGaqDetectorsRequestResult.getCurrent();
    }

    /**
     * Set result of request for changing set of GAQ detectors to NotAsked
     * @return {void}
     */
    dismissSubmitResult() {
        this._setGaqDetectorsRequestResult.setCurrent(RemoteData.notAsked());
    }
}
