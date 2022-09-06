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
 * Calculates the number of table rows that can be displayed on a page
 *
 * @param {number} rowHeight The height of each table row
 * @param {number} usedPageHeight The total height of every element in the page that is used
 *
 * @returns {number} The number of rows to be displayed with a minimum of 5 rows
 */
export const estimateDisplayableRowsCount = (rowHeight, usedPageHeight) => Math.max(
    5,
    Math.floor((window.innerHeight - usedPageHeight) / rowHeight),
);
