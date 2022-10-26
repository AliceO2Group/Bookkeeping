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
const { utilities: { TransactionHelper } } = require('../../../database');

/**
 * Find and return an run detector model by its id
 *
 * @param {string} runNumber the runNumber of the run to find
 * @param {string} detectorId the id of the detector to find
 * @param {function|null} qbConfiguration function called with the run detector find query builder as parameter to add specific configuration to
 *     the query
 * @param {Object|null} [transaction] optionally the transaction in which one the log creation is executed
 *
 * @return {Promise<SequelizeRunDetectors|null>} the run detector found or null
 */
exports.getRunDetector = async (runNumber, detectorId, qbConfiguration = null, transaction = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('run_number').is(runNumber);
    queryBuilder.where('detector_id').is(detectorId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return TransactionHelper.provide(async () => RunDetectorsRepository.findOne(queryBuilder), { transaction });
};
