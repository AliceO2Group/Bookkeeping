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
const { QC_DETECTOR_TYPES } = require('../../../domain/enums/DetectorTypes.js');

/**
 * Find and return a QC (PHYSICAL or QC_ONLY) detector identified by its name or id and throw if it does not exists
 *
 * @param {DetectorIdentifier} identifier the identifier of the detector to fetch
 * @return {Promise<Detector>} the found detector
 */
exports.getQcDetectorOrFail = async ({ detectorId, detectorName }) => {
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
                { type: { [Op.in]: QC_DETECTOR_TYPES } },
            ],
        },
    });

    if (!detector) {
        const criteriaExpression = detectorId !== undefined && detectorId !== null
            ? `id (${detectorId})`
            : `name (${detectorName})`;
        throw new NotFoundError(`QC detector with this ${criteriaExpression} could not be found`);
    }
    return detector;
};
