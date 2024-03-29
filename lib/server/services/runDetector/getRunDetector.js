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
const RunDetectorsRepository = require('../../../database/repositories/RunDetectorsRepository.js');

/**
 * Find and return a run detector model by its id
 *
 * @param {number} runNumber the runNumber of the run to find
 * @param {number} detectorId the id of the detector to find
 * @param {function|null} [qbConfiguration=null] function called with the run detector find query builder as parameter to add
 * specific configuration to the query
 * @return {Promise<SequelizeRunDetectors|null>} the run detector found or null
 */
exports.getRunDetector = async (runNumber, detectorId, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('run_number').is(runNumber);
    queryBuilder.where('detector_id').is(detectorId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return RunDetectorsRepository.findOne(queryBuilder);
};
