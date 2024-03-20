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

const { getShiftTagsFiltersByType } = require('./getShiftTagsFiltersByType.js');

/**
 * Filter the given list of logs to correspond to the given shift type
 *
 * @param {SequelizeLog[]} logs the logs to filter
 * @param {string} shiftType the type of the shift
 * @return {SequelizeLog[]} the filtered list of logs
 */
exports.filterLogsForShift = (logs, shiftType) => {
    const { include, exclude } = getShiftTagsFiltersByType(shiftType);
    return logs.filter(({ tags, parentLogId }) => {
        let toKeep = false;
        for (const { text } of tags) {
            if (parentLogId || exclude.includes(text)) {
                return false;
            }

            if (!toKeep && include.includes(text)) {
                toKeep = true;
            }
        }
        return toKeep;
    });
};
