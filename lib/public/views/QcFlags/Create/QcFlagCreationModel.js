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
     * @param {Array<{runNumber: number, detectorIds: number[]}>} array of objects with run number and detector ids
     * @param {function<number,*>} onCreationSuccess callback in case of successful QC flag creation
     */
    constructor({
        runNumberDetectorMap,
    }, onCreationSuccess) {
        super('/api/qcFlags', ({ id }) => onCreationSuccess(id));

        this._runNumberDetectorMap = runNumberDetectorMap;

        this._runNumbers = Object.keys(runNumberDetectorMap).map(Number);
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
        this._startTime = -Infinity;
        this._endTime = Infinity;

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
            flagTypeId: this._flagTypeSelectionModel.selected[0],
            from: this._isTimeBasedQcFlag ? this._timeRangeModel.fromTimeInputModel.value : null,
            to: this._isTimeBasedQcFlag ? this._timeRangeModel.toTimeInputModel.value : null,
            runNumber: this._runNumbers[0],
            dplDetectorId: this._dplDetectorIds[0],
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
            const { startTime, timeTrgEnd, timeO2End } = run;

            // Do not use run's endTime because it's automatically coalesced to `now`
            const endTime = timeTrgEnd ?? timeO2End ?? null;

            if (!startTime) {
                this._startTime = null;
            }
            if (!endTime) {
                this._endTime = null;
            }

            if (startTime > this._startTime) {
                this._startTime = startTime;
            }
            if (endTime < this._endTime) {
                this._endTime = endTime;
            }
        }

        this._timeRangeModel.fromTimeInputModel.setValue(this._startTime);
        this._timeRangeModel.toTimeInputModel.setValue(this._endTime);
        this._timeRangeModel.bubbleTo(this);
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
            const runNumbers = this._runNumbers.length > 1
                ? this._runNumbers.join(',')
                : `${this._runNumbers[0]},${this._runNumbers[0]}`; // Send duplicate runnumber if one to avoid partial runnumber matching

            const { data: runs } = await getRemoteData(`/api/runs/?filter[runNumbers]=${runNumbers}`);
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
     * @return {RemoteData<Run[]>} selected runs or current run
     */
    get runs() {
        return this._runs$.getCurrent();
    }

    /**
     * Dpl Detectors getter
     * @return {RemoteData<Object>} map of dpl run numbers with associated dpl detectors
     */
    get dplDetectors() {
        return this._dplDetectors$.getCurrent();
    }

    /**
     * Run number getter
     * @return {number[]} current run number
     */
    get runNumbers() {
        return this._runNumbers;
    }

    /**
     * Start time getter
     * @return {number} current start time
     */
    get startTime() {
        return this._startTime;
    }

    /**
     * End time getter
     * @return {number} current end time
     */
    get endTime() {
        return this._endTime;
    }

    /**
     * DplDetector id getter
     * @return {number[]} current dpl detector id
     */
    get dplDetectorIds() {
        return this._dplDetectorIds;
    }
}
