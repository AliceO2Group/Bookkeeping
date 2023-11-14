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
 * @property {number} count
 * @property {Object[]} items
 */

/**
 * @typedef CountedItemsHttpView
 * @property {number} [meta.page.totalCount]
 * @property {number|null} [meta.page.pageCount]
 * @property {Object[]} data
 */

/**
 * Adapt counted data to http api
 * @param {CountedItems} data  counted data
 * @param {number} itemsPerPage limit with which the data were acquired
 * @returns {CountedItemsHttpView} adapted result
 */
function countedItemsToHttpView({ count, items }, itemsPerPage) {
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
