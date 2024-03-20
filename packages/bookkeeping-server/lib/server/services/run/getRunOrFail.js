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

const { getRun } = require('./getRun.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find a run model by its run number or id and reject with a NotFoundError if none is found
 *
 * @param {RunIdentifier} identifier the identifier of the run to find
 * @param {function|null} qbConfiguration function called with the run find query builder as parameter to add specific configuration to the
 *     query
 * @param {Object} [transaction] optionally the transaction in which one the log creation is executed
 * @return {Promise<SequelizeRun>} resolve with the run model found or reject with a NotFoundError
 */
exports.getRunOrFail = async (identifier, qbConfiguration = null, transaction = null) => {
    const runModel = await getRun(identifier, qbConfiguration, transaction);
    if (runModel !== null) {
        return runModel;
    } else {
        const criteriaExpression = identifier.runId ? `id (${identifier.runId})` : `run number (${identifier.runNumber})`;
        throw new NotFoundError(`Run with this ${criteriaExpression} could not be found`);
    }
};
