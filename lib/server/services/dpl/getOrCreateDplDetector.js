/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { DplDetectorRepository } = require('../../../database/repositories/index.js');
const { DetectorType } = require('../../../domain/enums/DetectorTypes.js');

/**
 * Fetch (and create if it does not exist) a DPL detector
 *
 * @param {string} name the name of the dpl detector to find/create
 * @return {Promise<SequelizeDplDetector>} the dpl detector found
 */
exports.getOrCreateDplDetectorByName = async (name) => {
    const dplDetector = await DplDetectorRepository.findOne({ where: { name } });
    if (dplDetector) {
        return dplDetector;
    } else {
        return await DplDetectorRepository.insert({ name, type: DetectorType.QC });
    }
};
