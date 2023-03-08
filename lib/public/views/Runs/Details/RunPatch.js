import { Observable } from '/js/src/index.js';

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
         * @type {Run}
         * @private
         */
        this._run = run;

        this.reset();
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

        if (this._detectorsQualitiesPatches.size > 0) {
            ret.detectorsQualities = [];
            for (const [detectorId, quality] of this._detectorsQualitiesPatches.entries()) {
                ret.detectorsQualities.push({ detectorId, quality });
            }
        }

        if (this._eorReasons.length !== this._run.eorReasons.length || this._eorReasons.some(({ id }) => id === undefined)) {
            ret.eorReasons = this._eorReasons;
        }

        if (this._run.runQuality !== this._runQuality) {
            ret.runQuality = this._runQuality;
        }

        return ret;
    }

    /**
     * Reset the patch to no modification
     *
     * @return {void}
     */
    reset() {
        const { eorReasons = [], tags = [], detectorsQualities = [], runQuality } = this._run || {};

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
