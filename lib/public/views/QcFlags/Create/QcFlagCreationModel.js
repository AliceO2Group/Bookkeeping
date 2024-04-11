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
import { TimeRangeFilterModel } from '../../../components/Filters/common/filters/TimeRangeFilterModel.js';
import { CreationModel } from '../../../models/CreationModel.js';
import { dplDetectorsProvider } from '../../../services/detectors/dplDetectorsProvider.js';

/**
 * QC Flag Creation model
 */
export class QcFlagCreationModel extends CreationModel {
    /**
     * Constructor
     * @param {Object} parameters target entities identifiers
     * @param {number} [parameters.runNumber] runNumber of target run
     * @param {number} [parameters.dplDetectorId] id of target dpl detector
     * @param {function<number,*>} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor({
        runNumber,
        dplDetectorId,
    }, onCreationSuccess) {
        super('/api/qcFlags', ({ id }) => onCreationSuccess(id));

        this._runNumber = runNumber;
        this._run$ = new ObservableData(RemoteData.notAsked());
        this._run$.bubbleTo(this);

        this._dplDetectorId = dplDetectorId;
        dplDetectorsProvider.physical$.observe(() => this._getDetector());
        this._dplDetector$ = new ObservableData(RemoteData.notAsked());
        this._dplDetector$.bubbleTo(this);

        this._flagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._flagTypeSelectionModel.bubbleTo(this);
        this._flagTypeSelectionModel.visualChange$.bubbleTo(this);

        this._useTimeBasedQcFlag = false;

        this._initilize();
    }

    /**
     * Apply a patch on current form data
     *
     * @param {Partial<QcFlagTypeCreationFormData>} patch the patch to apply
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
            dplDetectorId: this._dplDetectorId,
            flagTypeId: this._flagTypeSelectionModel.selected[0],
            from: this._useTimeBasedQcFlag ? this._timeRangeModel.fromTimeInputModel.value : null,
            to: this._useTimeBasedQcFlag ? this._timeRangeModel.toTimeInputModel.value : null,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    isValid() {
        return this._flagTypeSelectionModel.selected.length > 0
            && (!this._useTimeBasedQcFlag || this._timeRangeModel.isValid);
    }

    /**
     * Initialize model
     * @returns {Promise<void>} promise
     */
    async _initilize() {
        this._getDetector();
        await this._fetchRun();
        this._run$.getCurrent().match({
            Other: () => null,
            Success: (run) => {
                const { startTime, endTime } = run;

                this._timeRangeModel = new TimeRangeFilterModel(null, null, {
                    required: true,
                    seconds: true,
                });

                this._timeRangeModel.fromTimeInputModel.setValue(startTime);
                this._timeRangeModel.toTimeInputModel.setValue(endTime);

                this._timeRangeModel.bubbleTo(this);

                this._canSendTimeBasedQcFlag = startTime && endTime;
            },
        });
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
     * States whether can mark run with time based QC flag, it is if and only if startTime and endTime of the run are not missing
     * @return {boolean} true if can send time based flag, false otherwise
     */
    get canSendTimeBasedQcFlag() {
        return this._canSendTimeBasedQcFlag;
    }

    /**
     * States whether user is expected to provide QC flag timestamp `from` and `to`
     * @return {boolean} true if timestamps are expected, false otherwise
     */
    get useTimeBasedQcFlag() {
        return this._useTimeBasedQcFlag;
    }

    /**
     * Set whether user is expected to provide QC flag timestamp `from` and `to`
     * @param {boolean} useTimeBasedQcFlag true if timestamps are expected, false otherwise
     */
    set useTimeBasedQcFlag(useTimeBasedQcFlag) {
        this._useTimeBasedQcFlag = useTimeBasedQcFlag;
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
     * Dpl Detector getter
     * @return {RemoteData<DplDetector>} current detector
     */
    get dplDetector() {
        return this._dplDetector$.getCurrent();
    }

    /**
     * Run number getter
     * @return {number} current run number
     */
    get runNumber() {
        return this._runNumber;
    }

    /**
     * DplDetector id getter
     * @return {number} current dpl detector id
     */
    get dplDetectorId() {
        return this._dplDetectorId;
    }
}
