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
const { DetectorType } = require('../../../domain/enums/DetectorTypes.js');

/**
 * Find all the data taking detectors corresponding to a list of detectors names. If any of the name do not correspond to a detector, creates it.
 * Created detector is physical, if detector exists and it is neither physical nor virtual it becomes physical
 *
 * @param {string[]} [detectorNames] the list of detectors name
 * @return {Promise<SequelizeDetector[]>} the list of detectors
 */
exports.getOrCreateAllDataTakingDetectorsByName = async (detectorNames) => {
    if (detectorNames.length === 0) {
        return [];
    }

    let detectors = await getDetectorsByNames(detectorNames);
    const dataTakingDetectors = detectors.filter(({ type }) => [DetectorType.PHYSICAL, DetectorType.VIRTUAL].includes(type));
    const nonDataTakingDetectors = detectors.filter(({ type }) => ![DetectorType.PHYSICAL, DetectorType.VIRTUAL].includes(type));

    if (nonDataTakingDetectors.length > 0) {
        await DetectorRepository.updateAll(
            { type: DetectorType.PHYSICAL },
            { where: { id: { [Op.in]: nonDataTakingDetectors.map(({ id }) => id) } } },
        );
        detectors = [
            ...dataTakingDetectors,
            ...await getDetectorsByNames(nonDataTakingDetectors.map(({ name }) => name)),
        ];
    }

    const missingDetectors = detectorNames.filter((name) => !detectors.find((detector) => name === detector.name));
    for (const detectorName of missingDetectors) {
        const id = await createDetector({ name: detectorName, type: DetectorType.PHYSICAL });
        detectors.push(await getDetector({ detectorId: id }));
    }

    return detectors;
};
