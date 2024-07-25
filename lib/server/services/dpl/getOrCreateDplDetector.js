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

const { sequelize } = require('../../../database/index.js');
const { DplDetectorRepository, DetectorRepository } = require('../../../database/repositories/index.js');
const { DetectorType } = require('../../../domain/enums/DetectorTypes.js');

/**
 * Fetch (and create if it does not exist) a DPL detector
 *
 * @param {string} name the name of the dpl detector to find/create
 * @return {Promise<SequelizeDplDetector>} the dpl detector found
 */
exports.getOrCreateDplDetectorByName = async (name) => {
    let dplDetector = await DplDetectorRepository.findOne({ where: { name } });
    if (dplDetector) {
        return dplDetector;
    } else {
        /**
         * Because of merging detectors and dpl_detector table,
         * temporarly detectors and dpl_detectors with same name must also have same id
         */
        dplDetector = await DplDetectorRepository.insert({ name });
        let detector = await DetectorRepository.findOne({ where: { name } });
        if (!detector) {
            detector = await DetectorRepository.insert({ name, type: DetectorType.QC });
        }
        const [[{ mid: maxDetectorId }]] = await sequelize.query('SELECT MAX(id) AS mid FROM detectors');
        const [[{ mid: maxDplDetectorId }]] = await sequelize.query('SELECT MAX(id) AS mid FROM dpl_detectors');
        const commonId = Math.max(maxDetectorId, maxDplDetectorId);

        /**
         * In sequelize, primary key cannot be updated using Model.update
         */
        if (detector.id !== commonId) {
            await sequelize.query(`UPDATE detectors SET id = ${commonId} WHERE name = '${detector.name}'`);
        }
        if (dplDetector.id !== commonId) {
            await sequelize.query(`UPDATE dpl_detectors SET id = ${commonId} WHERE name = '${dplDetector.name}'`);
        }

        return DplDetectorRepository.findOne({ where: { name } });
    }
};
