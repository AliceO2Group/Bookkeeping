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

const { repositories: { LhcPeriodStatisticsRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { lhcPeriodStatisticsAdapter } = require('../../../database/adapters');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * Reason for calculation of runs lhc beam distinct energies this way (using literals) is:
 * There is transitive association: `runs -> lhc_periods -> lhc_periods_statistics`.
 * Including runs in queries below causes that sequelize build internaly subquery to fetch data.
 * This subquery is an `SELECT ... FROM lhc_periods_statistics`,
 * but after adding ordering by `lhcPeriod.name` sequelize puts the `ORDER BY` clause inside that subquery,
 * what leads to error, because lhcPeriod is not in scope of the subquery.
 * Mentioned can be avoid by providing flag:  `subQuery: false`,
 * but this breaks limit clause, so pagination.
 * There is related issue for reference: https://github.com/sequelize/sequelize/issues/11983
 */
const DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE = {
    query: `(SELECT GROUP_CONCAT(DISTINCT(r.lhc_beam_energy))
        FROM runs AS r
        WHERE r.lhc_period_id = lhcPeriod.id 
            AND r.definition = 'PHYSICS'
    )`,

    alias: 'distinctEnergies',

    /**
     * Apply filtering by distinct energies to queryBuilder.
     * Put constrain to retrive only records which have list of distinctEnergies intersecting
     * with the given list of energies (respecting comparison of items up to certain precision).
     * @param {QueryBuilder} queryBuilder query builder
     * @param {string[]} distinctEnergies list of energies to filter by
     * @param {number} [precision = 2] precision of distinct energies values comparison,
     * because they are of type FLOAT, direct equality checking does not work well,
     * so they are compared up given number of decimal digits.
     * @return {void}
     */
    applyFilterQuery_intersectionOfDistinctEnergies: (queryBuilder, distinctEnergies, precision = 2) => queryBuilder.literalWhere(`
    EXISTS (
        SELECT *
        FROM runs AS r
        WHERE r.lhc_period_id = \`LhcPeriodStatistics\`.\`id\`
            AND r.definition = 'PHYSICS'
            AND CAST(r.lhc_beam_energy AS DECIMAL(6, ${precision})) IN(:distinctEnergies)
    )`, { distinctEnergies }),
};

/**
 * @typedef LhcPeriodIdentifier object to uniquely identify a lhc period
 * @property {string} [name] the lhc period name
 * @property {number} [id] the id of lhc period
 */

/**
 * LhcPeriodStatisticsService
 */
class LhcPeriodStatisticsService {
    /**
     * Find an LHC Period Statistics model by its name or id including
     * @param {LhcPeriodIdentifier} identifier the criteria to find run type
     * @return {Promise<LhcPeriodStatistics[]>} the run type found or null
     */
    async getByIdentifier({ id, name }) {
        const queryBuilder = dataSource.createQueryBuilder();
        queryBuilder.include({ association: 'lhcPeriod' });

        if (id !== null & id !== undefined) {
            queryBuilder.where('id').is(id);
        } else if (name) {
            queryBuilder.setModel('LhcPeriodStatistics')
                .whereAssociation('lhcPeriod', 'name').is(name);
        } else {
            throw new BadParameterError('Can not find without LHC Period id or name');
        }

        queryBuilder.includeAttribute(DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE);

        const data = await LhcPeriodStatisticsRepository.findOne(queryBuilder);
        return data ? lhcPeriodStatisticsAdapter.toEntity(data) : null;
    }

    /**
     * Find an LHC Period Statistics model by its name or id including
     * @param {LhcPeriodIdentifier} identifier the criteria to find run type
     * @throws {NotFoundError} in case there is no LHC Period with given identifier
     * @return {Promise<LhcPeriodStatistics[]>} the run type found or null
     */
    async getOneOrFail({ id, name }) {
        const lhcPeriodStatistics = await this.getByIdentifier({ id, name });
        if (!lhcPeriodStatistics) {
            const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
            throw new NotFoundError(`LHC Period with this ${criteriaExpression} could not be found`);
        }
        return lhcPeriodStatistics;
    }

    /**
     * Get all lhc periods with statistics
     * @param {Object|undefined} options define which records should be fetched
     * @param {Object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.ids] lhcPeriod identifier to filter with
     * @param {string[]} [options.filter.names] lhcPeriod names to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {Object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting -
     * array of mappings of field name to order type
     * @returns {Promise<CountedItems<LhcPeriodStatistics>>} result
     */
    async getAllForPhysicsRuns({
        filter,
        limit,
        offset,
        sort,
    } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();

        queryBuilder.include({
            association: 'lhcPeriod',
        });

        if (sort) {
            for (const property in sort) {
                let expression;
                if (property === 'name') {
                    expression = (sequelize) => sequelize.col('lhcPeriod.name');
                } else if (property === 'year') {
                    expression = (sequelize) => sequelize.literal('SUBSTRING(lhcPeriod.name, 4, 2)');
                }

                queryBuilder.orderBy(expression ?? property, sort[property]);
            }
        }

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        if (filter) {
            const { ids, names, years, distinctEnergies } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                queryBuilder.setModel('LhcPeriodStatistics')
                    .whereAssociation('lhcPeriod', 'name').oneOf(...names);
            }
            if (years) {
                queryBuilder.literalWhere(
                    'SUBSTRING(lhcPeriod.name, 4, 2) + 2000 IN (:years)',
                    { years },
                );
            }
            if (distinctEnergies) {
                DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE.applyFilterQuery_intersectionOfDistinctEnergies(queryBuilder, distinctEnergies);
            }
        }

        queryBuilder.includeAttribute(DISTINCT_ENERGIES_IN_STATISTICS_ATTRIBUTE);

        const { count, rows } = await LhcPeriodStatisticsRepository.findAndCountAll(queryBuilder);

        return {
            count,
            rows: rows.map(lhcPeriodStatisticsAdapter.toEntity),
        };
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
