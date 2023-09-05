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

const { getLogsByTagsInPeriod } = require('./getLogsByTagsInPeriod.js');

/**
 * Returns the occurrences of each tag found in a given shift's logs
 *
 * @param {Shift} shift the shift to look for gags
 * @return {Promise<Object<string, number>>} resolves with an object mapping between the tags text and their occurrences count
 */
exports.getShiftIssuesTagsOccurrences = async (shift) => {
    const logs = await getLogsByTagsInPeriod({ include: null, exclude: ['EoS'] }, { from: shift.start, to: shift.end }, { rootOnly: true });

    const counters = {};

    for (const { tags } of logs) {
        for (const { text } of tags) {
            if (!(text in counters)) {
                counters[text] = 0;
            }
            counters[text] += 1;
        }
    }

    return counters;
};
