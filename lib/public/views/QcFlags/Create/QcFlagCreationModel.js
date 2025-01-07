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
import { TriggerValue } from '../../../domain/enums/TriggerValue.js';

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
     * @param {Array<{runNumber: number, detectorIds: number[]}>} array of objects with run number and detector ids
     * @param {function<number,*>} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor({
        runNumberDetectorMap,
    }, onCreationSuccess) {
        super('/api/qcFlags', ({ id }) => onCreationSuccess(id));

        this._runNumberDetectorMap = runNumberDetectorMap;

        this._runNumbers = Object.keys(runNumberDetectorMap);
        this._runs$ = new ObservableData(RemoteData.notAsked());
        this._runs$.bubbleTo(this);

        this._dplDetectorIds = Object.values(runNumberDetectorMap).flat();
        detectorsProvider.qc$.observe(() => this._getDetectors());
        this._dplDetectors$ = new ObservableData(RemoteData.notAsked());
        this._dplDetectors$.bubbleTo(this);

        this._flagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._flagTypeSelectionModel.bubbleTo(this);
        this._flagTypeSelectionModel.visualChange$.bubbleTo(this);

        this._timeRangeModel = new TimeRangeInputModel(null, null, {
            required: true,
            seconds: true,
        });

        this._isTimeBasedQcFlag = false;
        this._triggerValueIsOff = false;

        this._startTimings = { startTime: Infinity };
        this._endTimings = { endTime: -Infinity };

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
            runNumbers: this._runNumbers,
            dplDetectorIds: this._dplDetectorIds,
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
     *     /**
     * Set start and end timings for the given runs
     * @param {Run[]} runs runs
     * @return {void}
     */
    setTimings(runs) {
        for (const run of runs) {
            const { startTime, timeTrgStart, timeO2Start, timeTrgEnd, timeO2End, triggerValue } = run;

            // Do not use run's endTime because it's automatically coalesced to `now`
            const endTime = timeTrgEnd ?? timeO2End ?? null;

            if (triggerValue === TriggerValue.Off) {
                this._triggerValueIsOff = true;
            }

            if (startTime < this._startTimings.startTime) {
                this._startTimings = { startTime, timeO2Start, timeTrgStart };
                this._timeRangeModel.fromTimeInputModel.setValue(startTime);
                this._timeRangeModel.bubbleTo(this);
            } if (endTime > this._endTimings.endTime) {
                this._endTimings = { endTime, timeO2End, timeTrgEnd };
                this._timeRangeModel.toTimeInputModel.setValue(endTime);
                this._timeRangeModel.bubbleTo(this);
            }
        }
    }

    /**
     * Initialize model
     * @returns {Promise<void>} promise
     */
    async _initialize() {
        this._getDetectors();
        await this._fetchRuns();
        this._runs$.getCurrent().match({
            Other: () => null,
            Success: (runs) => this.setTimings(runs),
        });
    }

    /**
     * Fetch runs data which for QC flag is to be created
     * @return {Promise<void>} promise
     */
    async _fetchRuns() {
        this._runs$.setCurrent(RemoteData.loading());
        try {
            const { data: runs } = await getRemoteData(`/api/runs/?filter[runNumbers]=${this._runNumbers}`);
            this._runs$.setCurrent(RemoteData.success(runs));
        } catch (error) {
            this._runs$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Process detectors and return matched detectors and errors
     * @param {DplDetector[]} dplDetectors array of detectors
     * @param {Object<number, number[]>} runNumberDetectorMap map of run numbers to detector ids
     * @returns {{matchedDetectors: Object<number, DplDetector[]>,
     *  errors: {title: string, detail: string}[]}} object with matched detectors and errors
     */
    _processDetectors(dplDetectors, runNumberDetectorMap) {
        const detectorMap = new Map(dplDetectors.map((detector) => [detector.id, detector]));
        const matchedDetectors = {};
        const errors = [];

        for (const [runNumber, detectorIds] of Object.entries(runNumberDetectorMap)) {
            const matched = detectorIds.map((id) => detectorMap.get(Number(id))).filter(Boolean);
            const missing = detectorIds.filter((id) => !detectorMap.has(Number(id)));

            if (missing.length > 0) {
                errors.push(...missing.map((id) => ({
                    title: `Detector with id ${id} not found`,
                    detail: `Detector with id ${id} is not found in the list of detectors user has access to`,
                })));
            }

            if (matched.length > 0) {
                matchedDetectors[runNumber] = matched;
            }
        }

        return { matchedDetectors, errors };
    }

    /**
     * Fetch DPL detector which for QC flag is to be created
     * @return {void}
     */
    _getDetectors() {
        this._dplDetectors$.setCurrent(detectorsProvider.qc$.getCurrent().match({
            Success: (dplDetectors) => {
                const { matchedDetectors, errors } = this._processDetectors(dplDetectors, this._runNumberDetectorMap);
                return errors.length > 0
                    ? RemoteData.failure({ errors })
                    : RemoteData.success(matchedDetectors);
            },
            Failure: RemoteData.failure,
            Loading: RemoteData.loading,
            NotAsked: RemoteData.notAsked,
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
     * Runs getter
     * @return {RemoteData<Run>} selected runs or current run
     */
    get runs() {
        return this._runs$.getCurrent();
    }

    /**
     * Trigger value is off getter
     * @return {boolean} true if trigger value is off, false otherwise
     */
    get triggerValueIsOff() {
        return this._triggerValueIsOff;
    }

    /**
     * Dpl Detectors getter
     * @return {RemoteData<DplDetector>} selected detectors or current detector
     */
    get dplDetectors() {
        return this._dplDetectors$.getCurrent();
    }

    /**
     * Run number getter
     * @return {number} current run number
     */
    get runNumbers() {
        return this._runNumbers;
    }

    /**
     * Start timings getter
     * @return {Object} current start timings
     */
    get startTimings() {
        return this._startTimings;
    }

    /**
     * End timings getter
     * @return {Object} current end timings
     */
    get endTimings() {
        return this._endTimings;
    }

    /**
     * DplDetector id getter
     * @return {number} current dpl detector id
     */
    get dplDetectorIds() {
        return this._dplDetectorIds;
    }

    /**
     * Time O2 start getter
     * @return {number} current time O2 start
     */
    get timeO2Start() {
        return this._startTimings.timeO2Start;
    }

    /**
     * Time TRG start getter
     * @return {number} current time TRG start
     */
    get timeTrgStart() {
        return this._startTimings.timeTrgStart;
    }

    /**
     * Time O2 end getter
     * @return {number} current time O2 end
     */
    get timeO2End() {
        return this._endTimings.timeO2End;
    }

    /**
     * Time TRG end getter
     * @return {number} current time TRG end
     */
    get timeTrgEnd() {
        return this._endTimings.timeTrgEnd;
    }

    /**
     * Trigger value getter
     * @return {TriggerValue} current trigger value
     */
    get triggerValue() {
        return this._startTimings.triggerValue ? null : TriggerValue.Off;
    }
}
