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

const { getLhcFill } = require('./getLhcFill.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find a lhcFill model by its lhcFill number or id and reject with a NotFoundError if none is found
 *
 * @param {number} fillNumber the identifier of the lhcFill to find
 * @return {lhcFill} resolve with the lhcFill model found or reject with a NotFoundError
 */
exports.getLhcFillByNumberOrFail = async (fillNumber) => {
    const lhcFillModel = await getLhcFill(fillNumber);

    if (lhcFillModel === null) {
        throw new NotFoundError(`LhcFill with this lhcFill number (${fillNumber}) could not be found`);
    }

    return lhcFillModel;
};
