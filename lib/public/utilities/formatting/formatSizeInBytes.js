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

const DATA_SIZE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB'];

/**
 * Format size in bytes as human readibly
 * @param {number} size number of bytes to be formatted
 * @return {string} formatted number
 */
export const formatSizeInBytes = (size) => {
    const exponent = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return `${Number((size / Math.pow(1024, exponent)).toFixed(2))} ${DATA_SIZE_UNITS[exponent]}`;
};
