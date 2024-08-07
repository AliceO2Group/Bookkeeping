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

const { utilities: { QueryBuilder } } = require('../../../database');
const { DplDetectorRepository } = require('../../../database/repositories/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * Find and return a DPL detector model by its id or name
 *
 * @param {DplDetectorIdentifier} detectorIdentifier the identifier of the detector to find
 * @return {Promise<SequelizeDplDetector|null>} the DPL detector found or null
 */
exports.getDplDetector = ({ detectorId, detectorName }) => {
    const queryBuilder = new QueryBuilder();
    if (detectorId) {
        queryBuilder.where('id').is(detectorId);
    } else if (detectorName) {
        queryBuilder.where('name').is(detectorName);
    } else {
        throw new BadParameterError('Can not find without DPL detector id or name');
    }
    return DplDetectorRepository.findOne(queryBuilder);
};
