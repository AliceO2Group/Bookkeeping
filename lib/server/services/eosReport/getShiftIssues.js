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

const { getLogsByTagsInPeriod } = require('../log/getLogsByTagsInPeriod.js');

/**
 * Returns the issues related to a given shift for a given tagsFilter based on shift type
 *
 * @param {Shift} shift the shift
 * @param {{include: (string[]|null), exclude: string[]}} tagsFilter the tags used to filter issues
 * @return {Promise<SequelizeLog[]>} resolves with the found logs
 */
exports.getShiftIssues = async (shift, tagsFilter) => getLogsByTagsInPeriod(
    tagsFilter,
    { from: shift.start, to: shift.end },
    { rootOnly: true },
);
