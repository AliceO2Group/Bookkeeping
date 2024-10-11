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
     * @return {Promise<{firstTfTimestamp: (number|undefined), lastTfTimestamp: (number|undefined)}>} the timeframes timestamps
     * @private
     */
    async _getRunStartAndEndTimeframes(runNumber) {
        const rawRunInformation = await this.fetchRunInformation(runNumber);
        const { objects } = rawRunInformation;

        if (objects.length !== 1) {
            return {};
        }

        const [runInfo] = objects;
        const timeframes = {};

        const { STF: stf, ETF: etf } = runInfo;
        if (stf) {
            timeframes.firstTfTimestamp = new Date(parseInt(stf, 10));
        }

        if (etf) {
            timeframes.lastTfTimestamp = new Date(parseInt(etf, 10));
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
        const response = await fetch(ccdbUrl, { headers: { Accept: 'application/json' } });
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Failed to query CCDB API');
        }
    }
}

exports.CcdbSynchronizer = CcdbSynchronizer;
