/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { models: { LhcPeriodStatistics } } = require('..');
const Repository = require('./Repository');
const { dataSource } = require('../DataSource.js');

const DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE = [
    `(SELECT GROUP_CONCAT(DISTINCT(r.lhc_beam_energy))
        FROM runs AS r
        WHERE r.lhc_period_id = lhcPeriod.id 
            AND r.definition = 'PHYSICS'
    )`,

    'distinctEnergies',
];

/**
 * Sequelize implementation of the RunTypeRepository.
 */
class LhcPeriodStatisticsRepository extends Repository {
    /**
     * Creates a new `LhcPeriodRepository` instance.
     */
    constructor() {
        super(LhcPeriodStatistics);
    }

    /**
     * Returns a specific entity.
     *
     * @param {QueryBuilder} [queryBuilder] the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise<Object>|null} Promise object representing the full mock data
     */
    async findOne(queryBuilder = dataSource.createQueryBuilder()) {
        queryBuilder.includeAttribute(...DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE);
        return this.model.findOne(queryBuilder.toImplementation());
    }

    /**
     * Returns all entities.
     *
     * @param {QueryBuilder} [queryBuilder] The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAndCountAll(queryBuilder = dataSource.createQueryBuilder()) {
        queryBuilder.set('distinct', true);
        queryBuilder.includeAttribute(...DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE);
        return this.model.findAndCountAll(queryBuilder.toImplementation());
    }
}

module.exports = new LhcPeriodStatisticsRepository();
