/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { sequelize } = require('../../../database/index.js');

/**
 * Consider all the runs that are still running but not in the given list of run numbers to be lost, and set their stop time to now
 *
 * @param {number[]} runNumbersOfRunningRuns the list of run numbers corresponding to runs that are actually running
 * @param {number} modificationTimeWindow the time we have (in MINUTES), after the start of a run, to purge them. If a run started more than this
 *     amount of minutes before NOW, it is NOT purged
 * @return {Promise<number[]>} resolve once the lost runs has been marked as ended with the list of ended runs numbers
 * @deprecated
 */
exports.setO2StopOfLostRuns = async (runNumbersOfRunningRuns, modificationTimeWindow) => {
    let fetchQuery = `
        SELECT run_number
        FROM runs
        WHERE time_o2_end IS NULL
          AND time_trg_end IS NULL
          AND COALESCE(time_trg_start, time_o2_start) IS NOT NULL
          AND COALESCE(time_trg_start, time_o2_start) > date_sub(now(), INTERVAL ${modificationTimeWindow} MINUTE)
    `;
    if (runNumbersOfRunningRuns.length > 0) {
        fetchQuery += ` AND run_number NOT IN (${runNumbersOfRunningRuns.join(',')})`;
    }
    const [runs] = await sequelize.query(fetchQuery, { raw: true });
    const runNumbers = runs.map(({ run_number }) => run_number);

    if (runNumbers.length > 0) {
        await sequelize.query(`
            UPDATE runs
            SET time_o2_end = now()
            WHERE run_number IN (${runNumbers.join(',')})
        `);
    }

    return runNumbers;
};
