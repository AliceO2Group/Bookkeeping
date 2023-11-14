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
 * @typedef CountedItems
 * @property {Number|Number[]} count simply number or list or list of sub-countings if counting was done upon groups of items
 * @property {Object[]} items
 */

/**
 * @typedef CountedItemsView
 * @property {Number} [meta.page.totalCount]
 * @property {Number|null} [meta.page.pageCount]
 * @property {Object[]} data
 */

/**
 * Adapt counted data to http api
 * @param {CountedItems} data  counted data
 * @param {Number} itemsPerPage limit with which the data were acquired
 * @returns {CountedItemsView} adapted result
 */
function countedItemsToHttpView({ count, items }, itemsPerPage) {
    count = Array.isArray(count) ? count.length : count;
    return {
        meta: {
            page: {
                totalCount: count,
                pageCount: itemsPerPage ? Math.ceil(count / itemsPerPage) : null,
            },
        },
        data: items,
    };
}

module.exports = {
    countedItemsToHttpView,
};
