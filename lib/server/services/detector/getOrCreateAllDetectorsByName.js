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

const { getDetectorsByNames } = require('./getDetectorsByNames.js');
const { createDetector } = require('./createDetector.js');
const { getDetector } = require('./getDetector.js');

/**
 * Find all the detectors corresponding to a list of detectors names. If any of the name do not correspond to a detector, creates it
 *
 * @param {string[]} [detectorNames] the list of detectors name
 * @return {Promise<SequelizeDetector[]>} the list of detectors
 */
exports.getOrCreateAllDetectorsByName = async (detectorNames) => {
    if (!detectorNames) {
        return [];
    }

    const detectors = await getDetectorsByNames(detectorNames);
    const missingDetectors = detectorNames.filter((name) => !detectors.find((detector) => name === detector.name));
    for (const detectorName of missingDetectors) {
        const id = await createDetector({ name: detectorName }, true);
        detectors.push(await getDetector({ detectorId: id }));
    }

    return detectors;
};
