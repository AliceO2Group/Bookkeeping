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

const { BadParameterError } = require('../../errors/BadParameterError.js');
const { DplDetectorRepository } = require('../../../database/repositories/index.js');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../errors/NotFoundError.js');

const NON_PHYSICAL_DETECTORS = ['TST'];

/**
 * Find and return a physical detector identified by its name or id and throw if it does not exists
 *
 * @param {number} dplDetectorId the id of the DPL detector to fetch
 * @return {Promise<DplDetector>} the found DPL detector
 */
exports.getPhysicalDplDetectorOrFail = async (dplDetectorId) => {
    const dplDetector = await DplDetectorRepository.findOne({
        where: {
            [Op.and]: [
                {id: dplDetectorId},
                { name: { [Op.notIn]: NON_PHYSICAL_DETECTORS } },
            ],
        },
    });

    if (!dplDetector) {
        throw new NotFoundError(`Physical DPL detector with this id (${dplDetectorId}) could not be found`);
    }
    return dplDetector;
};
