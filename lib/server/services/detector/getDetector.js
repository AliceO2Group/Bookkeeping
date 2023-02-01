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
const DetectorRepository = require('../../../database/repositories/DetectorRepository.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * @typedef DetectorIdentifier object to uniquely identify a detector
 * @property {number} [detectorId] the id of the detector
 * @property {string} [detectorName] the name of the detector, ignored if detectorId is present
 */

/**
 * Find and return a detector model by its name
 *
 * @param {DetectorIdentifier} detectorIdentifier the identifier of the detector to find
 * @param {function|null} qbConfiguration function called with the detector find query builder as parameter to add specific configuration to the
 *     query
 * @return {Promise<SequelizeDetector|null>} the detector found or null
 */
exports.getDetector = ({ detectorId, detectorName }, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    if (detectorId) {
        queryBuilder.where('id').is(detectorId);
    } else if (detectorName) {
        queryBuilder.where('name').is(detectorName);
    } else {
        throw new BadParameterError('Cannot find without detector id or detector name');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return DetectorRepository.findOne(queryBuilder);
};
