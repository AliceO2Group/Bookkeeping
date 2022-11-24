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
 * Clean a given prefix, to make it end by exactly one separator
 *
 * @param {string} prefix the prefix to clean
 * @param {string} separator the separator to append
 * @return {string} the resulting prefix
 */
export const cleanPrefix = (prefix, separator = '-') => {
    if (prefix && !prefix.endsWith(separator)) {
        return `${prefix}${separator}`;
    }
    return prefix;
};
