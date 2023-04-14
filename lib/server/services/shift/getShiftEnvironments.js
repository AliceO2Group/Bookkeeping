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
const { getShiftTagsFiltersByType } = require('./getShiftTagsFiltersByType.js');

/**
 * Returns the environments related to a given shift with pre-defined relations
 *
 * @param {Shift} shift the shift for which environments must be retrieved
 * @param {string} shiftType the type of shift to query data for
 * @return {Promise<SequelizeEnvironment[]>} the list of environments
 */
exports.getShiftEnvironments = async (shift, shiftType) => {
    const environments = await getEnvironmentsInPeriod(
        { from: shift.start, to: shift.end },
        { runs: { relations: { lhcFill: true, eorReasons: true, logs: true } } },
    );
    const { include, exclude } = getShiftTagsFiltersByType(shiftType);
    // Not able to filter logs in one pass, because we need to restrict them on their tags BUT fetch all of their tags
    for (const environment of environments) {
        for (const run of environment.runs) {
            run.logs = run.logs.filter(({ tags }) => {
                let toKeep = false;
                for (const { text } of tags) {
                    if (!toKeep && include.includes(text)) {
                        toKeep = true;
                    }
                    if (exclude.includes(text)) {
                        return false;
                    }
                }
                return toKeep;
            });
        }
    }
    return environments;
};
