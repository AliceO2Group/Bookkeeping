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

const { dplDetectorAdapter } = require('../../../database/adapters');
const { DplDetectorRepository } = require('../../../database/repositories/index.js');

/**
 * Dpl detectors system
 */
class DplDetectorsService {
    /**
     * Find and return all DPL detectors
     * @return {Promise<DplDetector[]>} the DPL detectors list
     */
    async getAll() {
        const detectors = await DplDetectorRepository.findAll();
        return detectors.map(dplDetectorAdapter.toEntity);
    }

    /**
     * Find DPL detectors which flags contribute to GAQ for given run and data pass
     *
     * @param {*} dataPassId id of data pass
     * @param {*} runNumber run number
     * @return {Promise<Partial<DplDetector>[]>} promise of DPL detectors
     */
    async getGaqDetectors(dataPassId, runNumber) {
        const detectors = await DplDetectorRepository.findAll({
            include: [{ association: 'gaqAssociation', where: { dataPassId, runNumber } }],
        });
        return detectors.map(dplDetectorAdapter.toMinifiedEntity);
    }
}

exports.DplDetectorsService = DplDetectorsService;

exports.dplDetectorsService = new DplDetectorsService();
