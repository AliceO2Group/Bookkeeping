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
const LhcPeriodRepository = require('../../../database/repositories/LhcPeriodRepository');

/**
 * Find and return a LHC period model by its id
 *
 * @param {number} lhcPeriodId the id of the LHC period to find
 * @param {function|null} qbConfiguration function called with the log find query builder as parameter to add specific configuration to the query
 * @return {Promise<SequelizeLog|null>} the LHC period found or null
 */
exports.getLhcPeriod = (lhcPeriodId, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('id').is(lhcPeriodId);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return LhcPeriodRepository.findOne(queryBuilder);
};
