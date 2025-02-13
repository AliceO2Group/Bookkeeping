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

import { Observable } from '/js/src/index.js';
import { QcFlagTypesSelectionDropdownModel } from '../../../components/qcFlags/qcFlagTypesSelectionDropdownModel.js';
import { TimeRangeInputModel } from '../../../components/Filters/common/filters/TimeRangeInputModel.js';
import { runsProvider } from '../../../services/run/runsProvider.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';

/**
 * @typedef QcFlagCreationFormData
 * @param {string} comment
 */

/**
 * QC Flag Creation model
 */
export class QcFlagCreationModel extends Observable {
    /**
     * Constructor
     * @param {Array<{run: Run, detectors: Detector[]}>} runsAndDetectors list of runs and detectors on which QC flags should be created
     */
    constructor(runsAndDetectors) {
        super();

        this._runsAndDetectors = runsAndDetectors;

        this._flagTypeSelectionModel = new QcFlagTypesSelectionDropdownModel({
            multiple: false,
        });
        this._flagTypeSelectionModel.bubbleTo(this);
        this._flagTypeSelectionModel.visualChange$.bubbleTo(this);

        const { startTime, endTime } = this._getTimings(runsAndDetectors.map(({ run }) => run));
        this._startTime = startTime;
        this._endTime = endTime;

        this._timeRangeModel = new TimeRangeInputModel(null, null, { required: true, seconds: true });
        this._timeRangeModel.fromTimeInputModel.setValue(startTime);
        this._timeRangeModel.toTimeInputModel.setValue(endTime);
        this._timeRangeModel.bubbleTo(this);
        this._isTimeBasedQcFlag = false;
    }

    /**
     * Creates a new QC flag creation model from a list of run numbers / detectors map
     *
     * @param {Map<number, number[]>} runNumberDetectorsMap map between run numbers and detectors for which QC flag should be created
     * @return {Promise<QcFlagCreationModel>} resolves once the qc flag creation model is loaded
     */
    static async fromRunNumberDetectorsMap(runNumberDetectorsMap) {
        const runNumbers = [...runNumberDetectorsMap.keys()];
        if (runNumbers.length === 0) {
            throw new Error('No run number specified.');
        }

        const [runs, detectors] = await Promise.all([
            runsProvider.getByRunNumbers(runNumbers),
            detectorsProvider.getQc()
                .then((detectors) => new Map(detectors.map((detector) => [detector.id, detector]))),
        ]);

        const runAndDetectors = [];
        for (const run of runs) {
            const runDetectors = runNumberDetectorsMap.get(run.runNumber)
                ?.map((detectorId) => detectors.get(detectorId))
                .filter((detector) => Boolean(detector));

            if (runDetectors.length > 0) {
                runAndDetectors.push({ run, detectors: runDetectors });
            }
        }

        if (runAndDetectors.length === 0) {
            throw new Error('You have no access to specified detectors.');
        }

        return new QcFlagCreationModel(runAndDetectors);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    reset() {
        this._comment = '';
    }

    /**
     * Returns the normalized data of the current QC flag creation model to be sent to the backend
     *
     * @return {object} normalized data
     */
    get normalized() {
        return {
            comment: this._comment,
            flagTypeId: this._flagTypeSelectionModel.selected[0],
            from: this._isTimeBasedQcFlag ? this._timeRangeModel.fromTimeInputModel.value : null,
            to: this._isTimeBasedQcFlag ? this._timeRangeModel.toTimeInputModel.value : null,
            runDetectors: this._runsAndDetectors.map(({ run, detectors }) => ({
                runNumber: run.runNumber,
                detectorIds: detectors.map(({ id }) => id),
            })),
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
     * Set start and end timings for the given runs
     *
     * @param {Run[]} runs runs the runs on which QC flags will be applied
     * @return {{startTime: (number|null), endTime: (number|null)}} the start/end times available for QC flags
     */
    _getTimings(runs) {
        if (runs.length === 0) {
            return { startTime: null, endTime: null };
        }

        const timings = {
            startTime: -Infinity,
            endTime: Infinity,
        };

        for (const run of runs) {
            const { firstTfTimestamp, timeTrgStart, timeO2Start, lastTfTimestamp, timeTrgEnd, timeO2End } = run;

            const startTime = Math.ceil((firstTfTimestamp ?? timeTrgStart ?? timeO2Start ?? null) / 1000) * 1000; // Round to next second
            // Do not use run's endTime because it's automatically coalesced to `now`
            const endTime = Math.floor(lastTfTimestamp ?? timeTrgEnd ?? timeO2End ?? null); // Round to previous second

            if (!startTime) {
                timings.startTime = null;
            }
            if (!endTime) {
                timings.endTime = null;
            }

            if (startTime > timings.startTime) {
                timings.startTime = startTime;
            }
            if (endTime < timings.endTime) {
                timings.endTime = endTime;
            }
        }

        return timings;
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
     *
     * @param {boolean} isTimeBasedQcFlag true if timestamps are expected, false otherwise
     */
    set isTimeBasedQcFlag(isTimeBasedQcFlag) {
        this._isTimeBasedQcFlag = isTimeBasedQcFlag;
        this.notify();
    }

    /**
     * Return the comment of the QC flag
     *
     * @return {string} the comment
     */
    get comment() {
        return this._comment;
    }

    /**
     * Set the comment of the QC flag
     *
     * @param {string} value the new comment value
     */
    set comment(value) {
        this._comment = value;
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
     * Return the list of runs for which a QC flag will be created
     *
     * @return {Run[]} the runs
     */
    get runs() {
        return this._runsAndDetectors.map(({ run }) => run);
    }

    /**
     * Return the list of runs together with their detectors for which QC flags will be created
     *
     * @return {({run: Run, detectors: Detector[]})[]} run with detectors list
     */
    get runsAndDetectors() {
        return this._runsAndDetectors;
    }
}
