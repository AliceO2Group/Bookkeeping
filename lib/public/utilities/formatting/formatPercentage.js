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
 * Format a percentage value
 *
 * @param {number|null|undefined} percentage the percentage value to format
 * @param {number} digits the amount of digits to display
 *
 * @return {string} the formatted output
 */
export const formatPercentage = (percentage, digits = 2) => {
    if (percentage !== undefined && percentage !== null && !isNaN(percentage)) {
        return `${percentage.toFixed(digits)}%`;
    } else {
        return '-';
    }
};
