import { Observable } from '/js/src/index.js';

/**
 * Model for a selection of detectors and runs combination
 */
export class RunDetectorsSelectionModel extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        /**
         * @type {Map<number, number[]>}
         * @private
         */
        this._selectedRunDetectors = new Map();
    }

    /**
     * States if a given run & detector is currently selected for grouped actions
     *
     * @param {number} runNumber run number of the selected run
     * @param {number} detectorId id of the selected detector
     * @return {boolean} true if the run and detectors are selected
     */
    isRunDetectorSelected(runNumber, detectorId) {
        return (this._selectedRunDetectors.get(runNumber) ?? []).includes(detectorId);
    }

    /**
     * Select a given run & detector for grouped actions
     *
     * @param {number} runNumber run number of the selected run
     * @param {number} detectorId id of the selected detector
     * @return {void}
     */
    selectRunDetector(runNumber, detectorId) {
        const runDetectors = this._selectedRunDetectors.get(runNumber) ?? [];
        if (runDetectors.length === 0) {
            this._selectedRunDetectors.set(runNumber, runDetectors);
        }

        if (!runDetectors.includes(detectorId)) {
            runDetectors.push(detectorId);
            this.notify();
        }
    }

    /**
     * Unselect a given run & detector for grouped actions
     *
     * @param {number} runNumber run number of the selected run
     * @param {number} detectorId id of the selected detector
     * @return {void}
     */
    unselectRunDetector(runNumber, detectorId) {
        const originalSelectionLength = this._selectedRunDetectors.size;
        const runDetectors = (this._selectedRunDetectors.get(runNumber) ?? [])
            .filter((selectedDetectorId) => selectedDetectorId !== detectorId);

        if (runDetectors.length === 0) {
            this._selectedRunDetectors.delete(runNumber);
        }

        if (runDetectors.length !== originalSelectionLength) {
            this.notify();
        }
    }

    /**
     * Get current selection query string
     */
    get selectedQueryString() {
        return [...this._selectedRunDetectors.entries()]
            .map(([runNumber, detectorIds]) => `${runNumber}:${detectorIds.join(',')}`)
            .join(';');
    }
}
