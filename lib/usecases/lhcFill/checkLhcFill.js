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

const { GetLhcFillUseCase } = require('../lhcFill');

/**
 * Check if the given LHC fill number belongs to an existing fill, and throw an error if not
 *
 * @param {number|null|undefined} fillNumber the fill number to check
 * @param {boolean} skipNullFillNumber true to not throw if the given fill number is not defined or null
 * @return {Promise<void>} Promise that resolves when the check is done
 */
const checkLhcFill = async (fillNumber, skipNullFillNumber = false) => {
    if (fillNumber === null || fillNumber === undefined) {
        if (skipNullFillNumber) {
            return;
        } else {
            throw new Error('Received an unexpected null fill number');
        }
    }

    const lhcFill = await new GetLhcFillUseCase().execute({ params: { fillNumber } });
    if (!lhcFill) {
        throw new Error(`LhcFill with id ('${fillNumber}') could not be found`);
    }
};

exports.checkLhcFill = checkLhcFill;
