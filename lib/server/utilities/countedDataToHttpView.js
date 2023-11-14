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
 * @typedef CountedData
 * @property {Number|Number[]} count
 * @property {Object[]} rows
 */

/**
 * @typedef CountedDataView
 * @property {Number} [meta.page.totalCount]
 * @property {Number|null} [meta.page.pageCount]
 * @property {Object[]} data
 */

/**
 * Adapt counted data to http view to api
 * @param {CountedData} data  counted data
 * @param {Number} itemsPerPage limit with which the data were acquired
 * @returns {CountedDataView} adapted result
 */
function countedDataToHttpView({ count, rows }, itemsPerPage) {
    count = Array.isArray(count) ? count.length : count;
    return {
        meta: {
            page: {
                totalCount: count,
                pageCount: itemsPerPage ? Math.ceil(count / itemsPerPage) : null,
            },
        },
        data: rows,
    };
}

module.exports = {
    countedDataToHttpView,
};
