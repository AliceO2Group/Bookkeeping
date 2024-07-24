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
const DetectorRepository = require('../../../database/repositories/DetectorRepository.js');
const { Op } = require('sequelize');

/**
 * Find all the physical detectors corresponding to a list of detectors names. If any of the name do not correspond to a detector, creates it
 *
 * @param {string[]} [detectorNames] the list of detectors name
 * @return {Promise<SequelizeDetector[]>} the list of detectors
 */
exports.getOrCreateAllPhysicalDetectorsByName = async (detectorNames) => {
    if (detectorNames.length === 0) {
        return [];
    }

    const { DetectorType } = await import('../../../public/domain/enums/DetectorTypes.mjs');

    let detectors = await getDetectorsByNames(detectorNames);
    const physicalDetectors = detectors.filter(({ type }) => type === DetectorType.Physical);
    const nonPhyscial = detectors.filter(({ type }) => type !== DetectorType.Physical);

    if (nonPhyscial.length > 0) {
        await DetectorRepository.updateAll(
            { type: DetectorType.Physical },
            { where: { id: { [Op.in]: nonPhyscial.map(({ id }) => id) } } },
        );
        detectors = [
            ...physicalDetectors,
            ...await getDetectorsByNames(nonPhyscial.map(({ name }) => name)),
        ];
    }

    const missingDetectors = detectorNames.filter((name) => !detectors.find((detector) => name === detector.name));
    for (const detectorName of missingDetectors) {
        const id = await createDetector({ name: detectorName, type: DetectorType.Physical });
        detectors.push(await getDetector({ detectorId: id }));
    }

    return detectors;
};
