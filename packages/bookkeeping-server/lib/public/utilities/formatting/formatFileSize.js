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
 * Format a given file size to be displayed in GB
 *
 * @param {string|number|null|undefined} size the size to format, in bytes
 * @return {string} the formatted size
 */
export const formatFileSize = (size) => {
    size = parseInt(size, 10);

    if (isNaN(size)) {
        return '-';
    }

    const value = size / 1e9;

    return `${value >= 1000 ? value.toFixed(3) : value.toPrecision(6)} GB`;
};
