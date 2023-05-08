/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { getRunsInPeriod } = require('../run/getRunsInPeriod.js');
const { filterLogsForShift } = require('./filterLogsForShift.js');
const { getRunDefinition } = require('../run/getRunDefinition.js');

/**
 * Returns the list of runs in the given shift
 *
 * @param {Shift} shift the shift in which runs must be fetched
 * @param {string} shiftType the type of the shift
 * @return {Promise<SequelizeRun>} the list of runs in the given shift
 */
exports.getShiftRuns = async (shift, shiftType) => {
    const runs = await getRunsInPeriod(
        { from: shift.start, to: shift.end },
        { lhcFill: true, eorReasons: true, logs: true, detectors: true, runType: true },
    );
    const runsByDefinition = {};
    for (const run of runs) {
        run.logs = filterLogsForShift(run.logs, shiftType);
        const definition = getRunDefinition(run);
        if (!(definition in runsByDefinition)) {
            runsByDefinition[definition] = [];
        }
        runsByDefinition[definition].push(run);
    }
    return runsByDefinition;
};
