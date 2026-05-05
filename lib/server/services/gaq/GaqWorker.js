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

        this.batchSmallerThanInvalidCountWarningTimesOccurring = 0;
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
            const { processedCount, totalInvalidCount } = await gaqService.popNInvalidSummaryAndRecalculate(batchSize);

            if (processedCount > 0) {
                this._logger.infoMessage(`Processed ${processedCount} out of ${totalInvalidCount} ` +
                    `invalidated GAQ summaries (batch size: ${batchSize})`);
            }

            if (totalInvalidCount > batchSize) {
                this.batchSmallerThanInvalidCountWarningTimesOccurring += 1;

                if (this.batchSmallerThanInvalidCountWarningTimesOccurring >= 5) {
                    this._logger.warnMessage('For 5 iterations, there have been more invalidated GAQ summaries than the batch size '
                        + `(${batchSize}). Consider increasing the batch size.`);
                }
            } else {
                this.batchSmallerThanInvalidCountWarningTimesOccurring = 0;
            }
        } catch (error) {
            this._logger.errorMessage(`Error recalculating GAQ summaries: ${error.message}\n${error.stack}`);
        } finally {
            this._isSynchronizing = false;
        }
    }
}

const gaqWorker = new GaqWorker();

exports.gaqWorker = gaqWorker;
