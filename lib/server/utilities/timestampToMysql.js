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

/**
 * Convert a UNIX timestamp (in ms) to a MySQL date expression
 *
 * @param {number} timestamp the timestamp to convert
 * @return {string} the resulting SQL date
 */
exports.timestampToMysql = (timestamp) => new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
