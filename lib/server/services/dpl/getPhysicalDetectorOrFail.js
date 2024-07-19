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
const { DetectorRepository } = require('../../../database/repositories/index.js');
const { Op } = require('sequelize');
const { NotFoundError } = require('../../errors/NotFoundError.js');

const NON_PHYSICAL_DETECTORS = ['TST'];

/**
 * Find and return a physical detector identified by its name or id and throw if it does not exists
 *
 * @param {DetectorIdentifier} identifier the identifier of the detector to fetch
 * @return {Promise<Detector>} the found detector
 */
exports.getPhysicalDetectorOrFail = async ({ detectorId, detectorName }) => {
    let criteria;
    if (detectorId !== undefined) {
        criteria = { id: detectorId };
    } else if (detectorName !== undefined) {
        criteria = { name: detectorName };
    } else {
        throw new BadParameterError('Can not find without id or name');
    }

    const detector = await DetectorRepository.findOne({
        where: {
            [Op.and]: [
                criteria,
                { name: { [Op.notIn]: NON_PHYSICAL_DETECTORS } },
            ],
        },
    });

    if (!detector) {
        const criteriaExpression = detectorId !== undefined && detectorId !== null
            ? `id (${detectorId})`
            : `name (${detectorName})`;
        throw new NotFoundError(`Physical detector with this ${criteriaExpression} could not be found`);
    }
    return detector;
};
