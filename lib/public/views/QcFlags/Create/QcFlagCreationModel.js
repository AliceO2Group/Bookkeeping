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

import { ObservableData } from '../../../utilities/ObservableData.js';
import { RemoteData } from '/js/src/index.js';
import { QcFlagTypesSelectionDropdownModel }
    from '../../../components/qcFlags/qcFlagTypesSelectionDropdownModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';
import { CreationModel } from '../../../models/CreationModel.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

/**
 * @typedef QcFlagCreationFormData
 * @param {string} comment
 */

/**
 * QC Flag Creation model
 */
export class QcFlagCreationModel extends CreationModel {
    /**
     * Constructor
     * @param {Object} parameters target entities identifiers
     * @param {number} [parameters.runNumber] runNumber of target run
     * @param {number} [parameters.detectorId] id of target dpl detector
     * @param {function<number,*>} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor({
        runNumber,
        detectorId,
    }, onCreationSuccess) {
        super('/api/qcFlags', ({ id }) => onCreationSuccess(id));

        this._runNumber = runNumber;
        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);

        this._detectorId = detectorId;
        detectorsProvider.physical$.observe(() => this._getDetector());
        this._detector$ = new ObservableData(RemoteData.notAsked());
        this._detector$.bubbleTo(this);

        this._flagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._flagTypeSelectionModel.bubbleTo(this);
        this._flagTypeSelectionModel.visualChange$.bubbleTo(this);

        this._isTimeBasedQcFlag = false;

        this._initialize();
    }

    /**
     * Apply a patch on current form data
     *
     * @param {Partial<QcFlagCreationFormData>} patch the patch to apply
     * @return {void}
     */
    patchFormData(patch) {
        this.formData = { ...this.formData, ...patch };
        this.notify();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _initOrResetData() {
        this.formData = {
            comment: null,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    _getSerializableData() {
        return {
            ...this.formData,
            runNumber: this._runNumber,
            detectorId: this._detectorId,
            flagTypeId: this._flagTypeSelectionModel.selected[0],
            from: this._isTimeBasedQcFlag ? this._timeRangeModel.fromTimeInputModel.value : null,
            to: this._isTimeBasedQcFlag ? this._timeRangeModel.toTimeInputModel.value : null,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    isValid() {
        return this._flagTypeSelectionModel.selected.length > 0
            && (!this._isTimeBasedQcFlag || this._timeRangeModel.isValid);
    }

    /**
     * Initialize model
     * @returns {Promise<void>} promise
     */
    async _initialize() {
        this._getDetector();
        await this._fetchRun();
        this._run$.getCurrent().match({
            Other: () => null,
            Success: (run) => {
                const { startTime, timeTrgEnd, timeO2End } = run;
                // Do not use run's endTime because it's automatically coalesced to `now`
                const endTime = timeTrgEnd ?? timeO2End ?? null;

                this._timeRangeModel = new TimeRangeInputModel(null, null, {
                    required: true,
                    seconds: true,
                });

                this._timeRangeModel.fromTimeInputModel.setValue(startTime);
                this._timeRangeModel.toTimeInputModel.setValue(endTime);

                this._timeRangeModel.bubbleTo(this);
            },
        });
    }

    /**
     * Fetch run data which for QC flag is to be created
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
     * Fetch DPL detector which for QC flag is to be created
     * @return {void}
     */
    _getDetector() {
        this._detector$.setCurrent(detectorsProvider.physical$.getCurrent().match({
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
     * States whether user is expected to provide QC flag timestamp `from` and `to`
     * @return {boolean} true if timestamps are expected, false otherwise
     */
    get isTimeBasedQcFlag() {
        return this._isTimeBasedQcFlag;
    }

    /**
     * Set whether user is expected to provide QC flag timestamp `from` and `to`
     * @param {boolean} isTimeBasedQcFlag true if timestamps are expected, false otherwise
     * @return {void}
     */
    setIsTimeBasedQcFlag(isTimeBasedQcFlag) {
        this._isTimeBasedQcFlag = isTimeBasedQcFlag;
        this.notify();
    }

    /**
     * Get QC flag types selection model
     * @return {QcFlagTypesSelectionDropdownModel} model
     */
    get flagTypeSelectionModel() {
        return this._flagTypeSelectionModel;
    }

    /**
     * Get input model for QC flag `from` and `to` timestamps
     * @return {DateTimeInputModel} model
     */
    get timeRangeModel() {
        return this._timeRangeModel;
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
     * @return {RemoteData<Detector>} current detector
     */
    get detector() {
        return this._detector$.getCurrent();
    }

    /**
     * Run number getter
     * @return {number} current run number
     */
    get runNumber() {
        return this._runNumber;
    }

    /**
     * Detector id getter
     * @return {number} current dpl detector id
     */
    get detectorId() {
        return this._detectorId;
    }
}
