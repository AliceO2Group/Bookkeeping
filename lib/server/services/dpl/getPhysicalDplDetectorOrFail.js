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
 * @param {DplDetectorIdentifier} identifier the identifier of the DPL detector to fetch
 * @return {Promise<DplDetector>} the found DPL detector
 */
exports.getPhysicalDplDetectorOrFail = async ({ dplDetectorId, dplDetectorName }) => {
    let criteria;
    if (dplDetectorId !== undefined) {
        criteria = { id: dplDetectorId };
    } else if (dplDetectorName !== undefined) {
        criteria = { name: dplDetectorName };
    } else {
        throw new BadParameterError('Can not find without id or name');
    }

    const dplDetector = await DplDetectorRepository.findOne({
        where: {
            [Op.and]: [
                criteria,
                { name: { [Op.notIn]: NON_PHYSICAL_DETECTORS } },
            ],
        },
    });

    if (!dplDetector) {
        const criteriaExpression = dplDetectorId !== undefined && dplDetectorId !== null
            ? `id (${dplDetectorId})`
            : `name (${dplDetectorName})`;
        throw new NotFoundError(`Physical DPL detector with this ${criteriaExpression} could not be found`);
    }
    return dplDetector;
};
