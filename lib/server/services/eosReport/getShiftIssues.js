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

const { getLogsByUserInPeriod } = require('../log/getLogsByUserInPeriod.js');
const { getLogsByTagsInPeriod } = require('../log/getLogsByTagsInPeriod.js');

/**
 * Returns the issues related to a given shift for a given shifter
 *
 * @param {Shift} shift the shift
 * @param {SequelizeUser} shifter the shifter
 * @param {string[]} tagsTexts the tag used to filter issues not created by the filter
 * @return {Promise<SequelizeLog[]>} resolves with the found logs
 */
exports.getShiftIssues = async (shift, shifter, tagsTexts) => {
    const issuesLogEntriesByUser = await getLogsByUserInPeriod(shifter, { from: shift.start, to: shift.end }, { tags: true });

    /**
     * List of entries with at least  tag DCS / ECS / "QC/PDP" / SL / SLIMOS sorted by tags - Title of the entry - Link
     */
    const issuesLogEntriesByTag = await getLogsByTagsInPeriod(tagsTexts, { from: shift.start, to: shift.end });

    return [
        ...issuesLogEntriesByUser,
        ...issuesLogEntriesByTag.filter((log) => !issuesLogEntriesByUser.some((logOfUser) => logOfUser.id === log.id)),
    ];
};
