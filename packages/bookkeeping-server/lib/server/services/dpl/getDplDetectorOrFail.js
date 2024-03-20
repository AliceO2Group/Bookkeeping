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
 * @param {DplDetectorIdentifier} detectorIdentifier the identifier of the detector to find
 * @return {Promise<SequelizeDplDetector>} resolve with the DPL detector model found or reject with a NotFoundError
 */
exports.getDplDetectorOrFail = async (detectorIdentifier) => {
    const dplDetectorModel = await getDplDetector(detectorIdentifier);

    if (dplDetectorModel !== null) {
        return dplDetectorModel;
    } else {
        const criteriaExpression = detectorIdentifier.dplDetectorId
            ? `id (${detectorIdentifier.dplDetectorId})`
            : `name (${detectorIdentifier.dplDetectorName})`;
        throw new NotFoundError(`DPL detector with this ${criteriaExpression} could not be found`);
    }
};
