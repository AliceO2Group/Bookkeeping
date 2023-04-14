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

const { getEnvironmentsInPeriod } = require('../environment/getEnvironmentsInPeriod.js');

const ECS_EOR_REPORT_RUNS_LOGS_REQUIRED_TAGS = ['ECS', 'ECS Shifter'];

/**
 * Returns the environments related to a given shift with pre-defined relations
 *
 * @param {Shift} shift the shift for which environments must be retrieved
 * @return {Promise<SequelizeEnvironment[]>} the list of environments
 */
exports.getShiftEnvironments = async (shift) => {
    const environments = await getEnvironmentsInPeriod(
        { from: shift.start, to: shift.end },
        { runs: { relations: { lhcFill: true, eorReasons: true, logs: true } } },
    );
    // Not able to filter logs in one pass, because we need to restrict them on their tags BUT fetch all of their tags
    for (const environment of environments) {
        for (const run of environment.runs) {
            run.logs = run.logs.filter(({ tags }) => tags.some(({ text }) => ECS_EOR_REPORT_RUNS_LOGS_REQUIRED_TAGS.includes(text)));
        }
    }
    return environments;
};
