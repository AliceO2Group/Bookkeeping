const { getGoodPhysicsRunsWithMissingTfTimestamps } = require('../../services/run/getRunsMissingTfTimestamps.js');
const { runService } = require('../../services/run/RunService.js');

/**
 * Synchronizer for CCDB data
 */
class CcdbSynchronizer {
    /**
     * Constructor
     * @param {string} runInfoUrl the CCDB URL where run information is to be retrieved
     */
    constructor(runInfoUrl) {
        this._runInfoUrl = runInfoUrl;
    }

    /**
     * Sync first and last TF for the good physics runs created within a given time window before now
     *
     * @param {Date} synchronizeAfter limit the update to runs created after this date
     * @return {Promise<void>} resolves once all runs have been updated
     */
    async syncFirstAndLastTf(synchronizeAfter) {
        const runs = await getGoodPhysicsRunsWithMissingTfTimestamps(synchronizeAfter);

        for (const { runNumber } of runs) {
            const timeframes = await this._getRunStartAndEndTimeframes(runNumber);

            if (timeframes.firstTfTimestamp || timeframes.lastTfTimestamp) {
                await runService.update({ runNumber }, { runPatch: timeframes });
            }
        }
    }

    /**
     * Return the timestamps of the first and last timeframe of the given run extracted from CCDB
     *
     * @param {number} runNumber the run number for which TF timestamps should be fetched
     * @return {Promise<{firstTfTimestamp: number, lastTfTimestamp: number}>} the timeframes timestamps
     * @private
     */
    async _getRunStartAndEndTimeframes(runNumber) {
        const rawRunInformation = await this.fetchRunInformation(runNumber);
        const timeframes = {};

        for (const line of rawRunInformation.split('\n')) {
            const stfMatch = line.match(/STF\s=\s(\d+)/);
            if (stfMatch) {
                const [, timestamp] = stfMatch;
                timeframes.firstTfTimestamp = new Date(parseInt(timestamp, 10));
            }

            const etfMatch = line.match(/ETF\s=\s(\d+)/);
            if (etfMatch) {
                const [, timestamp] = etfMatch;
                timeframes.lastTfTimestamp = new Date(parseInt(timestamp, 10));
            }

            if (timeframes.firstTfTimestamp && timeframes.lastTfTimestamp) {
                break;
            }
        }

        return timeframes;
    }

    /**
     * Fetch the raw run information from CCDB API
     *
     * @param {number} runNumber the run number for which information should be retrieved
     * @return {Promise<string>} the run information
     */
    async fetchRunInformation(runNumber) {
        const ccdbUrl = `${this._runInfoUrl}/${runNumber}`;
        const response = await fetch(ccdbUrl);
        if (response.ok) {
            return await response.text();
        } else {
            throw new Error('Failed to query CCDB API');
        }
    }
}

exports.CcdbSynchronizer = CcdbSynchronizer;
