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
 * @property {{totalCount: Number, pageCount: Number}} meta
 * @property {Object[]} data
 */

/**
 * Adapt services and usecases results of type 'findAndCountAll' to api
 * @param {CountedData} data count from findAndCountAll method
 * @param {Number} [pagination.limit] limit with which the data were acquired from db
 * @returns {CountedDataView} adapted result
 */
function countedDataToHttpView({ count, rows }, { limit }) {
    count = Array.isArray(count) ? count.length : count;
    return {
        meta: {
            totalCount: count,
            pageCount: limit ? Math.ceil(count / limit) : null,
        },
        data: rows,
    };
}

module.exports = {
    countedDataToHttpView,
};
