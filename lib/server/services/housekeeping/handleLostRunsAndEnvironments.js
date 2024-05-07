const { buildUrl } = require('../../../utilities/buildUrl.js');
const { transitionToErrorLostEnvironments } = require('../environment/transitionToErrorLostEnvironments.js');
const { setO2StopOfLostRuns } = require('../run/setO2StopOfLostRuns.js');
const { ServicesConfig } = require('../../../config/index.js');

const MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Handle lost environments and runs
 *
 * For all environments that has not been destroyed and have not gone to error, check through AliECS GUI if they are still active, and if not,
 * mark them as gone to error. For all runs that do not have timeO2Stop or timeTrgStop, check through AliECS GUI if they are still running, and
 * if not, mark them as stopped NOW
 *
 * @return {Promise<{transitionedEnvironments: number[], endedRuns: []}>} resolve with the list of environment ids and run numbers that were lost
 * @deprecated
 */
exports.handleLostRunsAndEnvironments = async () => {
    // TODO remove with node 18
    const { default: fetch } = await import('node-fetch');
    const existingEnvironmentsResponse = await fetch(buildUrl(
        `${ServicesConfig.aliEcsGui.url}/api/core/environments`,
        { token: ServicesConfig.aliEcsGui.token },
    ));

    if (existingEnvironmentsResponse.ok) {
        const { environments } = await existingEnvironmentsResponse.json();
        const environmentIdsToKeep = [];
        const runNumbersToKeep = [];
        for (const environment of environments) {
            const { id, currentRunNumber } = environment;
            environmentIdsToKeep.push(id);
            if (currentRunNumber) {
                runNumbersToKeep.push(currentRunNumber);
            }
        }

        // Environments and runs created outside this time window (timestamps in ms) will not be updated
        const modificationPeriod = {
            // Don't update runs and environments lost more than 48 hours ago
            from: Date.now() - MILLISECONDS_IN_ONE_DAY * 2,
            // Don't update runs and environments created less than 30 seconds ago
            to: Date.now() - 1000 * 30,
        };

        const transitionedEnvironments = await transitionToErrorLostEnvironments(environmentIdsToKeep, modificationPeriod);
        const endedRuns = await setO2StopOfLostRuns(runNumbersToKeep, modificationPeriod);

        return { transitionedEnvironments, endedRuns };
    } else {
        throw new Error(`Received ${existingEnvironmentsResponse.status} from AliECS GUI`);
    }
};
