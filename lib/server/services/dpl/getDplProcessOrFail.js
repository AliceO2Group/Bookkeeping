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

const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getDplProcess } = require('./getDplProcess.js');

/**
 * Find a DPL process model by its id and reject with a NotFoundError if none is found
 *
 * @param {DplProcessIdentifier} processIdentifier the identifier of the process to find
 * @return {Promise<SequelizeDplProcess>} resolve with the DPL process model found or reject with a NotFoundError
 */
exports.getDplProcessOrFail = async (processIdentifier) => {
    const dplProcessModel = await getDplProcess(processIdentifier);

    if (dplProcessModel !== null) {
        return dplProcessModel;
    } else {
        const criteriaExpression = processIdentifier.dplProcessId
            ? `id (${processIdentifier.dplProcessId})`
            : `name (${processIdentifier.dplProcessName}) and type id (${processIdentifier.dplProcessTypeId})`;
        throw new NotFoundError(`DPL process with this ${criteriaExpression} could not be found`);
    }
};
