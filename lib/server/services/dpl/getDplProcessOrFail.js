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
 * @param {number} processId the id of the process to find
 * @return {Promise<SequelizeDplProcess>} resolve with the DPL process model found or reject with a NotFoundError
 */
exports.getDplProcessOrFail = async (processId) => {
    const dplProcessModel = await getDplProcess(processId);

    if (dplProcessModel !== null) {
        return dplProcessModel;
    } else {
        throw new NotFoundError('DPL process with this id could not be found');
    }
};
