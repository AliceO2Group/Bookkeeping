const { gaqService } = require('../../services/gaq/GaqService.js');
const { LogManager } = require('@aliceo2/web-ui');

// Tolerate brief blips before warning so transient overshoots don't spam logs
const OVERFLOW_THRESHOLD_TICKS = 5;

// While the overflow persists, re-warn at this cadence so operators see "still bad" without log floods
const OVERFLOW_REMINDER_EVERY_TICKS = 30;

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
        this._currentRun = null;

        // Adaptive batch size for the next tick. Null on first tick → falls back to the passed-in min.
        this._nextBatchSize = null;

        this._overflowConsecutiveTicks = 0;
    }

    /**
     * Pause the worker so it skips future scheduled calls, and await any in-flight call to finish
     * so callers can safely mutate shared state (e.g. drop tables in tests) once this resolves
     * @return {Promise<void>} resolves once the worker is idle and paused
     */
    async pause() {
        if (!this._isPaused) {
            this._logger.infoMessage('Worker paused');
        }
        this._isPaused = true;
        if (this._currentRun) {
            try {
                await this._currentRun;
            } catch {
                // Already logged inside _doRecalculate
            }
        }
    }

    /**
     * Resume the worker after a pause
     * @return {void}
     */
    resume() {
        if (this._isPaused) {
            this._logger.infoMessage('Worker resumed');
        }
        this._isPaused = false;
    }

    /**
     * Process pending GAQ summary invalidations. Skips if a previous call is still in progress or if paused.
     * The batch size for this tick is clamped between min and max and adapts to the observed backlog.
     * @param {number} minBatchSize lower bound on rows to fetch per tick
     * @param {number} maxBatchSize upper bound on rows to fetch per tick
     * @return {Promise<void>} promise
     */
    async recalculateGaqSummaries(minBatchSize, maxBatchSize) {
        if (this._isPaused || this._currentRun) {
            return;
        }
        this._currentRun = this._doRecalculate(minBatchSize, maxBatchSize);
        try {
            await this._currentRun;
        } finally {
            this._currentRun = null;
        }
    }

    /**
     * Run a single recalculation pass; errors are logged but not rethrown
     * @param {number} minBatchSize lower bound on rows to fetch per tick
     * @param {number} maxBatchSize upper bound on rows to fetch per tick
     * @return {Promise<void>} promise
     */
    async _doRecalculate(minBatchSize, maxBatchSize) {
        const clamp = (n) => Math.min(maxBatchSize, Math.max(minBatchSize, n));
        const batchSize = clamp(this._nextBatchSize ?? minBatchSize);

        try {
            const { processedCount, totalInvalidCount } = await gaqService.popNInvalidSummaryAndRecalculate(batchSize);

            // Adapt next tick's batch size to the observed backlog (clamped to the bounds)
            this._nextBatchSize = clamp(totalInvalidCount);

            if (processedCount > 0) {
                this._logger.infoMessage(`Processed ${processedCount} out of ${totalInvalidCount} ` +
                    `invalidated GAQ summaries (batch size: ${batchSize})`);
            }

            // Overflow: backlog still exceeds the max even at the largest batch we'll fetch
            if (totalInvalidCount > maxBatchSize) {
                this._overflowConsecutiveTicks += 1;

                const ticks = this._overflowConsecutiveTicks;
                const firstWarning = ticks === OVERFLOW_THRESHOLD_TICKS;
                const reminderDue = ticks > OVERFLOW_THRESHOLD_TICKS
                    && (ticks - OVERFLOW_THRESHOLD_TICKS) % OVERFLOW_REMINDER_EVERY_TICKS === 0;

                if (firstWarning || reminderDue) {
                    this._logger.warnMessage(`Invalidated GAQ summary backlog (${totalInvalidCount}) has exceeded `
                        + `the max batch size (${maxBatchSize}) for ${ticks} consecutive ticks. `
                        + 'Consider raising GAQ_RECALCULATION_MAX_BATCH_SIZE or shortening GAQ_RECALCULATION_PERIOD.');
                }
            } else {
                if (this._overflowConsecutiveTicks >= OVERFLOW_THRESHOLD_TICKS) {
                    this._logger.infoMessage(`GAQ summary backlog recovered after ${this._overflowConsecutiveTicks} `
                        + `consecutive overflow ticks (current backlog: ${totalInvalidCount})`);
                }
                this._overflowConsecutiveTicks = 0;
            }
        } catch (error) {
            this._logger.errorMessage(`Error recalculating GAQ summaries: ${error.message}\n${error.stack}`);
        }
    }
}

const gaqWorker = new GaqWorker();

exports.gaqWorker = gaqWorker;
