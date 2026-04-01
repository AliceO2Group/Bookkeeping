const { gaqService } = require('../../services/gaq/GaqService.js');
const { LogManager } = require('@aliceo2/web-ui');

/**
 * Worker responsible for processing pending GAQ summary invalidations
 */
class GaqWorker {
    /**
     * Constructor
     */
    constructor() {
        this._logger = LogManager.getLogger(GaqWorker.name);
        this._isPaused = false;
        this._isSynchronizing = false;
    }

    /**
     * Pause the worker so it skips processing on the next scheduled calls
     * @return {void}
     */
    pause() {
        this._isPaused = true;
    }

    /**
     * Resume the worker after a pause
     * @return {void}
     */
    resume() {
        this._isPaused = false;
    }

    /**
     * Process pending GAQ summary invalidations. Skips if a previous call is still in progress or if paused.
     * @param {number} batchSize number of invalid summaries to recalculate
     * @return {Promise<void>} promise
     */
    async recalculateGaqSummaries(batchSize) {
        if (this._isSynchronizing || this._isPaused) {
            return;
        }
        this._isSynchronizing = true;
        try {
            await gaqService.popNInvalidSummaryAndRecalculate(batchSize);
        } catch (error) {
            this._logger.errorMessage(`Error recalculating GAQ summaries: ${error.message}\n${error.stack}`);
        } finally {
            this._isSynchronizing = false;
        }
    }
}

const gaqWorker = new GaqWorker();

exports.gaqWorker = gaqWorker;
