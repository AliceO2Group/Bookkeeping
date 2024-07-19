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
const { getDetector } = require('./getDetector.js');

/**
 * Find a detector model by its id and reject with a NotFoundError if none is found
 *
 * @param {DetectorIdentifier} detectorIdentifier the identifier of the detector to find
 * @return {Promise<SequelizeDetector>} resolve with the detector model found or reject with a NotFoundError
 */
exports.getDetectorOrFail = async (detectorIdentifier) => {
    const detectorModel = await getDetector(detectorIdentifier);

    if (detectorModel !== null) {
        return detectorModel;
    } else {
        const criteriaExpression = detectorIdentifier.detectorId
            ? `id (${detectorIdentifier.detectorId})`
            : `name (${detectorIdentifier.detectorName})`;
        throw new NotFoundError(`detector with this ${criteriaExpression} could not be found`);
    }
};
