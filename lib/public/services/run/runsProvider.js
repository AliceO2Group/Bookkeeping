import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

/**
 * Provider for runs
 */
export class RunsProvider {
    /**
     * Fetch the runs with given run number
     *
     * @param {number[]} runNumbers the run numbers of runs to fetch
     * @return {Promise<Run[]>} the found runs
     */
    async getByRunNumbers(runNumbers) {
        const runNumbersFilter = runNumbers.length > 1
            ? runNumbers.join(',')
            : `${runNumbers[0]},${runNumbers[0]}`; // Send duplicate run number if one to avoid partial run number matching

        const { data: runs } = await getRemoteData(`/api/runs/?filter[runNumbers]=${runNumbersFilter}`);
        return runs;
    }
}

export const runsProvider = new RunsProvider();
