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
const { getLhcFillByNumberOrFail } = require('./getLhcFillByNumberOrFail.js');

/**
 * Returns the list of lhcFill ids extracted from a comma separated (CSV) list of lhcFill numbers
 *
 * @param {number[]} [lhcFills] the CSV list of lhcFill numbers
 * @return {Promise<null|number[]>} the list of lhcFill ids
 * @private
 */
exports.getLhcFillNumbersOrFail = async (lhcFills) => {
    if (!lhcFills) {
        return null;
    }

    // Error out if any value is NaN
    if (lhcFills.some(Number.isNaN)) {
        throw new Error('LhcFill numbers must contain only numbers');
    }

    /**
     * Check if, for each lhcFill number, there is a lhcFill present in the DB with that lhcFill number
     * and return those that are present.
     */
    const retrievedLhcFills = [];
    for (const possibleFillNumber of lhcFills) {
        const { fillNumber } = await getLhcFillByNumberOrFail(possibleFillNumber);
        retrievedLhcFills.push(fillNumber);
    }
    return retrievedLhcFills;
};
