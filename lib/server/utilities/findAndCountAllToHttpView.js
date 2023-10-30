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

// eslint-disable-next-line require-jsdoc
function findAndCountAllToHttpView(dbResponse) {
    const { count, rows } = dbResponse;

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
