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
 * @param {boolean} [milliseconds=false] if true, milliseconds will be stored in database
 * @return {string} the resulting SQL date
 */
exports.timestampToMysql = (timestamp, milliseconds = false) => {
    let dateIso = new Date(timestamp).toISOString();
    dateIso = dateIso.slice(0, milliseconds ? 23 : 19);
    return dateIso.replace('T', ' ');
};
