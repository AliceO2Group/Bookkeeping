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
const { getLogsByTitle } = require('../log/getLogsByTitle.js');

/**
 * Returns the issues related to a given shift for a given tagsFilter based on shift type
 *
 * @param {String} title the title used to filter issues
 * @return {Promise<SequelizeLog[]>} resolves with the found logs
 */
exports.getShiftIssuesByTitle = async (title) => getLogsByTitle(title, { rootOnly: true });
