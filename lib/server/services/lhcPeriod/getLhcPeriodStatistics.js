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

const { dataSource } = require('../../../database/DataSource.js');
const { LhcPeriodStatisticsRepository } = require('../../../database/repositories/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * @typedef LhcPeriodIdentifier object to uniquely identify a lhc period
 * @property {string} [name] the lhc period name
 * @property {number} [id] the id of lhc period
 */

/**
 * Find and return the statistics of an LHC period by the id or the name of the period
 *
 * @param {LhcPeriodIdentifier} identifier the identifier of the LHC period for which statistics must be found (the name is ignored if the id is
 *     present)
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the statistics find query builder as parameter
 *     to add specific configuration to the query
 * @return {Promise<SequelizeLhcPeriodStatistics|null>} resolves with the statistics found or null
 */
exports.getLhcPeriodStatistics = async ({ id, name }, qbConfiguration = null) => {
    const queryBuilder = dataSource.createQueryBuilder();

    if (id !== undefined && id !== null) {
        queryBuilder.where('id').is(id);
    } else if (name) {
        queryBuilder.whereAssociation('lhcPeriod', 'name').is(name);
    } else {
        throw new BadParameterError('Can not find without LHC Period id or name');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    return await LhcPeriodStatisticsRepository.findOne(queryBuilder) ?? null;
};
