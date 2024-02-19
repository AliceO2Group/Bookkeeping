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
const { RunQualities } = require('../../../domain/enums/RunQualities.js');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');
const { RunDefinition } = require('../run/getRunDefinition.js');

/**
 * It's assumed that lhc_period is period of some common parameters for runs (PHYSICS),
 * e.g. the same beam type. All PHYSICS runs belonging to the one lhc periods have the same pdp_beam_type.
 * Because some might be null (errors, whatever), there is `NOT NULL` condition
 * Because need only one portion of information of beam type, there is LIMIT 1
 * Data from cosmic-PHYSICS run (there is only one) should not be presented in this case.
 */
const PDP_BEAM_TYPES_IN_STATISTICS_SUBQUERY = `
    (SELECT r.pdp_beam_type
        FROM runs AS r
        WHERE r.lhc_period_id = lhcPeriod.id 
            AND r.definition = 'PHYSICS'
            AND r.run_quality = 'good'
            AND r.pdp_beam_type IS NOT NULL
        LIMIT 1
    )`;

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
        const queryBuilder = this.prepareQueryBuilder();
        queryBuilder.include({ association: 'lhcPeriod' });

        if (id !== null & id !== undefined) {
            queryBuilder.where('id').is(id);
        } else if (name) {
            queryBuilder.whereAssociation('lhcPeriod', 'name').is(name);
        } else {
            throw new BadParameterError('Can not find without LHC Period id or name');
        }

        const data = await LhcPeriodStatisticsRepository.findOne(queryBuilder);
        return data ? lhcPeriodStatisticsAdapter.toEntity(data) : null;
    }

    /**
     * Find an LHC Period Statistics model by its name or id
     * @param {LhcPeriodIdentifier} identifier the criteria to find lhc period
     * @throws {NotFoundError} in case there is no LHC Period with given identifier
     * @return {Promise<LhcPeriodStatistics[]>} the lhc period statistics found
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
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            for (const property in sort) {
                let expression;
                switch (property) {
                    case 'name':
                        expression = (sequelize) => sequelize.col('`lhcPeriod`.`name`');
                        break;
                    case 'year':
                        expression = (sequelize) => sequelize.literal('SUBSTRING(lhcPeriod.name, 4, 2)');
                        break;
                    case 'beamType':
                        expression = (sequelize) => sequelize.literal(PDP_BEAM_TYPES_IN_STATISTICS_SUBQUERY);
                        break;
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
            const { ids, names, years, beamTypes } = filter;
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                queryBuilder.whereAssociation('lhcPeriod', 'name').oneOf(...names);
            }
            if (years) {
                queryBuilder.literalWhere(
                    'SUBSTRING(lhcPeriod.name, 4, 2) + 2000 IN (:years)',
                    { years },
                );
            }
            if (beamTypes) {
                queryBuilder.literalWhere(
                    `${PDP_BEAM_TYPES_IN_STATISTICS_SUBQUERY} IN (:beamTypes)`,
                    { beamTypes },
                );
            }
        }

        const { count, rows } = await LhcPeriodStatisticsRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length,
            rows: rows.map(lhcPeriodStatisticsAdapter.toEntity),
        };
    }

    /**
     * Prepare common fetch data query builder
     * @return {QueryBuilder} query builder with common includes
     */
    prepareQueryBuilder() {
        return dataSource.createQueryBuilder()
            .set('subQuery', false)
            .include((sequelize) => ({
                association: 'lhcPeriod',
                include: [
                    {
                        association: 'runs',
                        attributes: [
                            [sequelize.fn('count', sequelize.fn('distinct', sequelize.col('lhcPeriod->runs.run_number'))), 'count'],
                            [
                                sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->runs.lhc_beam_energy'))),
                                'distinctEnergies',
                            ],
                            [
                                sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->runs.pdp_beam_type'))),
                                'beamType',
                            ],
                        ],
                        where: {
                            definition: RunDefinition.Physics,
                            runQuality: RunQualities.GOOD,
                        },
                        required: false,
                    },
                    {
                        association: 'dataPasses',
                        attributes: [[sequelize.fn('count', sequelize.fn('distinct', sequelize.col('lhcPeriod->dataPasses.id'))), 'count']],
                        required: false,
                    },
                ],
            }))
            .groupBy('id');
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
