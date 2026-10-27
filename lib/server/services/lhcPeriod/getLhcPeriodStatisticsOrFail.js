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

const { getLhcPeriodStatistics } = require('./getLhcPeriodStatistics.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find the statistics of an LHC period by the id or the name of the period, and reject with a NotFoundError if there is none
 *
 * @param {LhcPeriodIdentifier} identifier the identifier of the LHC period for which statistics must be found (the name is ignored if the id is
 *     present)
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the statistics find query builder as parameter
 *     to add specific configuration to the query
 * @return {Promise<SequelizeLhcPeriodStatistics>} resolves with the statistics found or rejects with a NotFoundError
 */
exports.getLhcPeriodStatisticsOrFail = async (identifier, qbConfiguration = null) => {
    const lhcPeriodStatistics = await getLhcPeriodStatistics(identifier, qbConfiguration);
    if (lhcPeriodStatistics === null) {
        const { id, name } = identifier;
        const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
        throw new NotFoundError(`LHC Period with this ${criteriaExpression} could not be found`);
    }

    return lhcPeriodStatistics;
};
