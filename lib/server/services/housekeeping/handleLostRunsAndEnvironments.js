const { services } = require('../../../config/services.js');
const { buildUrl } = require('../../../utilities/buildUrl.js');
const { transitionToErrorLostEnvironments } = require('../environment/transitionToErrorLostEnvironments.js');
const { setO2StopOfLostRuns } = require('../run/setO2StopOfLostRuns.js');

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
        `${services.aliEcsGUI.url}/api/core/environments`,
        { token: services.aliEcsGUI.token },
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

        // Maximum amount of minutes after run start/environment creation to purge them
        const modificationTime = 2880;

        const transitionedEnvironments = await transitionToErrorLostEnvironments(environmentIdsToKeep, modificationTime);
        const endedRuns = await setO2StopOfLostRuns(runNumbersToKeep, modificationTime);

        return { transitionedEnvironments, endedRuns };
    } else {
        throw new Error(`Received ${existingEnvironmentsResponse.status} from AliECS GUI`);
    }
};
