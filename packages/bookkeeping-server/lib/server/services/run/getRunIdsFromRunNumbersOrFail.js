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

const { getRunOrFail } = require('./getRunOrFail.js');

/**
 * Returns the list of run ids extracted from a comma separated (CSV) list of run numbers
 *
 * @param {number[]} [runNumbers] the CSV list of run numbers
 * @return {Promise<null|number[]>} the list of run ids
 * @private
 */
exports.getRunIdsFromRunNumbersOrFail = async (runNumbers) => {
    if (!runNumbers) {
        return null;
    }

    // Error out if any value is NaN
    if (runNumbers.some(Number.isNaN)) {
        throw new Error('Run numbers must contain only numbers');
    }

    /**
     * Check if, for each runNumber, there is a run present in the DB with that runNumber
     * Add the run's id to runIds if there is.
     */
    const runIds = [];
    for (const runNumber of runNumbers) {
        const { id } = await getRunOrFail({ runNumber });
        runIds.push(id);
    }

    return runIds;
};
