/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

/**
 * Format the given timestamp in the common format, i.e. en-GB locale with short date and medium time
 *
 * @param {number|null} timestamp the timestamp to format (in milliseconds)
 * @return {string} the formatted timestamp
 */
export const formatTimestamp = (timestamp) => timestamp !== null
    ? new Date(timestamp).toLocaleString('en-GB', { timeStyle: 'medium', dateStyle: 'short' })
    : '-';
