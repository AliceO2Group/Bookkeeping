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

/**
 * Create a new DPL detector, without prior check for duplication
 *
 * @param {Partial<SequelizeDplDetector>} dplDetector the DPL detector to create
 * @return {Promise<number>} the id of the generated DPL detector
 */
exports.createDplDetector = async (dplDetector) => {
    const { /** @type {number} id */ id } = await DplDetectorRepository.insert(dplDetector);
    return id;
};
