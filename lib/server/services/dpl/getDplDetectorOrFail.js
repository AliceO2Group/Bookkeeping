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
const { getDplDetector } = require('./getDplDetector.js');

/**
 * Find a DPL detector model by its id and reject with a NotFoundError if none is found
 *
 * @param {number} detectorId the id of the detector to find
 * @return {Promise<SequelizeDplDetector>} resolve with the DPL detector model found or reject with a NotFoundError
 */
exports.getDplDetectorOrFail = async (detectorId) => {
    const dplDetectorModel = await getDplDetector(detectorId);

    if (dplDetectorModel !== null) {
        return dplDetectorModel;
    } else {
        throw new NotFoundError('DPL detector with this id could not be found');
    }
};
