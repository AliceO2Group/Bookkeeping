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

const { CtpTriggerCountersRepository } = require('../../../database/repositories/index.js');
const { utilities: { QueryBuilder } } = require('../../../database');

/**
 * Return the list of all the CTP trigger counters
 *
 * @param {Function|null} [qbConfiguration] function called with the counters query builder as parameter to add specific configuration to the
 *     query
 * @return {Promise<SequelizeCtpTriggerCounters[]>} Promise resolving with the list of counters
 */
exports.getAllCtpTriggerCounters = (qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();
    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return CtpTriggerCountersRepository.findAll(queryBuilder);
};
