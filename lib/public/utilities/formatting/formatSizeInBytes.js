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

const DATA_SIZE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Format size in bytes as human readable
 * @param {number} size number of bytes to be formatted
 * @return {string} formatted number
 */
export const formatSizeInBytes = (size) => {
    if (size === null || size === undefined) {
        return '-';
    }
    const exponent = Math.min(
        size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024)),
        DATA_SIZE_UNITS.length - 1,
    );
    return `${Number((size / Math.pow(1024, exponent)).toFixed(2))} ${DATA_SIZE_UNITS[exponent]}`;
};
