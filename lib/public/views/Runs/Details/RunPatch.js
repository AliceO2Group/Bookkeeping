import { Observable } from '/js/src/index.js';
import { RUN_CALIBRATION_STATUS, RunCalibrationStatus } from '../../../domain/enums/RunCalibrationStatus.js';
import { RunQualities } from '../../../domain/enums/RunQualities.js';

/**
 * @typedef EorReasonPatch
 * @property {number} [id]
 * @property {number} reasonTypeId
 * @property {string} description
 */

/**
 * Represents a patch that may be applied to an existing run
 */
export class RunPatch extends Observable {
    /**
     * Constructor
     * @param {Run} [run] the run on which the patch will be applied
     */
    constructor(run) {
        super();

        /**
         * Store the run to reset patch
         *
         * @type {Run|undefined}
         * @private
         */
        this._run = run;

        this.reset();
    }

    /**
     * States if the current patch is valid
     * @return {boolean} true if the patch is valid
     */
    isValid() {
        // If we change the run quality, we require a reason
        const runQualityChangeReasonIsValid = !this.requireRunQualityChangeReason()
            || this._runQualityChangeReason && this._runQualityChangeReason.trim();

        // If we change the calibration status, we require a reason
        const calibrationStatusChangeReasonIsValid = !this.requireCalibrationStatusChangeReason
            || this._calibrationStatusChangeReason && this._calibrationStatusChangeReason.trim();

        // If we change the detectors qualities, we require a reason
        const detectorQualityChangeReasonIsValid = !this.hasAnyDetectorsQualityChange()
            || this._detectorsQualitiesChangeReason && this._detectorsQualitiesChangeReason.trim();

        return calibrationStatusChangeReasonIsValid && detectorQualityChangeReasonIsValid && runQualityChangeReasonIsValid;
    }

    /**
     * Returns the patch in the form of a simple object that can be displayed as JSON
     *
     * @return {object} the JSON version of the patch
     */
    toPojo() {
        const ret = {};

        if (this._tags.length !== this._run.tags.length || this._run.tags.some(({ text }) => !this._tags.includes(text))) {
            ret.tags = this._tags;
        }

        if (this.hasAnyDetectorsQualityChange()) {
            ret.detectorsQualities = [];
            for (const [detectorId, quality] of this._detectorsQualitiesPatches.entries()) {
                ret.detectorsQualities.push({ detectorId, quality });
            }
            ret.detectorsQualitiesChangeReason = this._detectorsQualitiesChangeReason;
        }

        if (this._eorReasons.length !== this._run.eorReasons.length || this._eorReasons.some(({ id }) => id === undefined)) {
            ret.eorReasons = this._eorReasons;
        }

        if (this.hasRunQualityChange) {
            ret.runQuality = this._runQuality;
            ret.runQualityChangeReason = this._runQualityChangeReason;
        }

        if (this._run.calibrationStatus !== this._calibrationStatus) {
            ret.calibrationStatus = this._calibrationStatus;
        }

        if (this.requireCalibrationStatusChangeReason) {
            ret.calibrationStatusChangeReason = this._calibrationStatusChangeReason;
        }

        return ret;
    }

    /**
     * Reset the patch to no modification
     *
     * @return {void}
     */
    reset() {
        const { calibrationStatus, eorReasons = [], tags = [], detectorsQualities = [], runQuality } = this._run || {};

        this._runQuality = runQuality;
        this._eorReasons = eorReasons.map(({ id, description, reasonTypeId }) => ({ id, description, reasonTypeId }));
        this._tags = tags.map(({ text }) => text);

        /**
         * Stores, for each detector, its current quality
         * @type {Map<number, string>}
         * @private
         */
        this._detectorsQualities = new Map();
        for (const { id, quality } of detectorsQualities) {
            this._detectorsQualities.set(id, quality);
        }

        /**
         * Stores, for each detector the new quality if it is different from the current one
         * @type {Map<number, string>}
         * @private
         */
        this._detectorsQualitiesPatches = new Map();

        this._calibrationStatus = calibrationStatus;
    }

    /**
     * Returns the patched run quality
     *
     * @return {string} the quality
     */
    get runQuality() {
        return this._runQuality;
    }

    /**
     * Set the runQuality
     * @param {string|undefined} runQuality the patched run quality
     * @return {void}
     */
    setRunQuality(runQuality) {
        this._runQuality = runQuality;
        this.notify();
    }

    /**
     * States if the current run quality change require justification
     * @return {boolean} true if the quality change require justification
     */
    requireRunQualityChangeReason() {
        return this.hasRunQualityChange()
            && !(this._run.runQuality === RunQualities.NONE
                && (this._runQuality === RunQualities.GOOD || this._runQuality === RunQualities.TEST));
    }

    /**
     * States if the run quality has been changed
     *
     * @return {boolean} true if the run quality has been changed
     */
    hasRunQualityChange() {
        return this._run.runQuality !== this._runQuality;
    }

    /**
     * Return the reason of the run quality change
     *
     * @return {string} the quality change reason
     */
    get runQualityChangeReason() {
        return this._runQualityChangeReason;
    }

    /**
     * Set the reason of the run quality change
     *
     * @param {string} reason the reason
     */
    set runQualityChangeReason(reason) {
        this._runQualityChangeReason = reason;
        this.notify();
    }

    /**
     * Define the patch's tag list
     *
     * @param {string[]} tags the tags list
     * @return {void}
     */
    setTags(tags) {
        this._tags = tags;
        this.notify();
    }

    /**
     * Add a new EOR reason to the patch
     * @param {EorReasonPatch} newEorReason the EOR reason to add
     * @return {void}
     */
    addEorReason({ reasonTypeId, description }) {
        const isNew = this._eorReasons.every((eorReason) => eorReason.reasonTypeId !== reasonTypeId || eorReason.description !== description);

        if (isNew) {
            this._eorReasons.push({ description, reasonTypeId });
        }

        this.notify();
    }

    /**
     * Delete an EOR reason patch from the run patch
     *
     * @param {EorReasonPatch} eorReasonPatch the EOR reason to delete from the patch
     * @return {void}
     */
    removeEorReason(eorReasonPatch) {
        const eorIndex = this._eorReasons.findIndex((reference) => compareEorReasonsPatch(reference, eorReasonPatch));
        if (eorIndex >= 0) {
            this._eorReasons.splice(eorIndex, 1);
        }
        this.notify();
    }

    /**
     * Returns the patched list of EOR reasons for the patched run
     * @return {EorReasonPatch[]} the list of EOR reasons patch in the run patch
     */
    get eorReasons() {
        return this._eorReasons;
    }

    /**
     * Returns the quality assigned for a given detector
     *
     * @param {number} detectorId the id of the detector
     * @return {string|undefined} the quality
     */
    getDetectorQuality(detectorId) {
        return this._detectorsQualitiesPatches.get(detectorId);
    }

    /**
     * Defines the quality of a given detector
     *
     * @param {number} detectorId the id of the detector
     * @param {string} quality the quality of the detector
     * @return {void}
     */
    setDetectorQuality(detectorId, quality) {
        if (this._detectorsQualities.get(detectorId) === quality) {
            this._detectorsQualitiesPatches.delete(detectorId);
        } else {
            this._detectorsQualitiesPatches.set(detectorId, quality);
        }
        this.notify();
    }

    /**
     * States if any of the detector quality is being patched
     *
     * @return {boolean} true if any detector quality is changing
     */
    hasAnyDetectorsQualityChange() {
        return this._detectorsQualitiesPatches.size > 0;
    }

    /**
     * Returns the reason of the detectors' qualities change, if it applies
     *
     * @return {string} the change reason
     */
    get detectorsQualityChangeReason() {
        return this._detectorsQualitiesChangeReason || '';
    }

    /**
     * Set the reason of the detectors' qualities change, if it applies
     * @param {string} reason the change reason
     */
    set detectorsQualityChangeReason(reason) {
        this._detectorsQualitiesChangeReason = reason;
        this.notify();
    }

    /**
     * Returns the current calibration status
     * @return {string} the current calibration status
     */
    get calibrationStatus() {
        return this._calibrationStatus;
    }

    /**
     * Set the current calibration status
     * @param {string} calibrationStatus the new calibration status
     * @return {void}
     */
    set calibrationStatus(calibrationStatus) {
        if (!RUN_CALIBRATION_STATUS.includes(calibrationStatus)) {
            throw new Error('Invalid calibration status');
        }

        this._calibrationStatus = calibrationStatus;
        this.notify();
    }

    /**
     * States if the current run and patch require a calibration status change reason
     *
     * @return {boolean} true if a reason is required
     */
    get requireCalibrationStatusChangeReason() {
        return Boolean(this._run.calibrationStatus === RunCalibrationStatus.FAILED
            ^ this._calibrationStatus === RunCalibrationStatus.FAILED);
    }

    /**
     * Returns the current reason for calibration status change, if it applies
     * @return {string} the reason
     */
    get calibrationStatusChangeReason() {
        return this._calibrationStatusChangeReason;
    }

    /**
     * If it applies, set the current reason for calibration status change
     * @param {string} reason the new reason
     */
    set calibrationStatusChangeReason(reason) {
        if (!this.requireCalibrationStatusChangeReason) {
            throw new Error('This run do not require calibration status change reason');
        }
        this._calibrationStatusChangeReason = reason;
        this.notify();
    }
}

/**
 * Compare two EOR reasons patch and states if they are the same
 *
 * @param {EorReasonPatch} a the first element to compare
 * @param {EorReasonPatch} b the second element to compare
 * @return {boolean} true if the two EOR reasons patches are the same
 */
const compareEorReasonsPatch = (a, b) => a.id === b.id && a.reasonTypeId === b.reasonTypeId && a.description === b.description;
