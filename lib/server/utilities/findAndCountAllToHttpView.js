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
 * Adapt services and usecases results of type 'findAndCountAll' to api
 * @param {Number} [dbResponse.count] count from findAndCountAll method
 * @param {Object[]} [dbResponse.rows] data from findAndCountAll method
 * @returns {Object} adapted result
 */
function findAndCountAllToHttpView({ count, rows }) {
    count = Array.isArray(count) ? count.length : count;
    return {
        meta: {
            totalCount: count,
            pageCount: rows.length > 0 ? Math.ceil(count / rows.length) : 0,
        },
        data: rows,
    };
}

module.exports = {
    findAndCountAllToHttpView,
};
