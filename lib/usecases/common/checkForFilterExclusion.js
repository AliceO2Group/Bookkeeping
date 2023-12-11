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
 * Checks if there is an exclusion sign in front of the variable dtoField, and
 * removes the exclusion sign, if present.
 *
 * @param {string} dtoFilter the value to check for an exclusion sign.
 * @returns {object} represents the parsed result.
 * @property {boolean} excl indicates whether the first character of dtoFilter
 *      is equal to exclSign.
 * @property {string} strippedFilter the filtered string with the first
 *      character removed if excl is true, otherwise, the original dtoFilter.
 */
exports.checkForFilterExclusion = (dtoFilter) => {
    const exclSign = '!';
    const isExclusion = dtoFilter.charAt(0) === exclSign;

    return {
        excl: isExclusion,
        strippedFilter: isExclusion ? dtoFilter.slice(1) : dtoFilter,
    };
};