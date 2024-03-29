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

const { getRunDetector } = require('./getRunDetector.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find an run detector model by its run number and detector id. It will reject with a NotFoundError if none is found
 *
 * @param {number} runNumber the run number of the run detector to find
 * @param {number} detectorId the id of the run detector to find
 * @param {function|null} [qbConfiguration=null] function called with the run detector find query builder as parameter to add
 * specific configuration to the query
 * @return {Promise<SequelizeRunDetector>} resolve with the run detector model found or reject with a NotFoundError
 */
exports.getRunDetectorOrFail = async (runNumber, detectorId, qbConfiguration) => {
    const runDetectorModel = await getRunDetector(runNumber, detectorId, qbConfiguration);
    if (runDetectorModel !== null) {
        return runDetectorModel;
    } else {
        throw new NotFoundError(`This run's detector with runNumber: (${runNumber}) and with detector Id: (${detectorId}) could not be found`);
    }
};
