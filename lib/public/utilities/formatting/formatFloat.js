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
 * Format float number
 * @param {number} value number to be formatted
 * @param {number} [options.precision = 3] precision of displayed value
 * @return {string} formatted number
 */
export const formatFloat = (value, { precision = 3 } = {}) =>
    value !== null && value !== undefined ? parseFloat(value).toLocaleString(undefined, { maximumFractionDigits: precision }) : '-';
