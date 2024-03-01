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

const { Op } = require('sequelize');
const { repositories: { LhcPeriodStatisticsRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { lhcPeriodStatisticsAdapter } = require('../../../database/adapters');
const { RunQualities } = require('../../../domain/enums/RunQualities.js');
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');
const { RunDefinition } = require('../run/getRunDefinition.js');

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
                    case 'beamTypes':
                        expression = (sequelize) => sequelize.literal('beamTypes');
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
                const targetIds = (await LhcPeriodStatisticsRepository.findAll({
                    raw: true,
                    include: {
                        association: 'lhcPeriod',
                        required: true,
                        include: {
                            association: 'runs',
                            required: true,
                            where: {
                                pdpBeamType: { [Op.in]: beamTypes },
                                definition: RunDefinition.Physics,
                                runQuality: RunQualities.GOOD,
                            },
                        },
                    },
                })).map(({ id }) => id);
                queryBuilder.where('id').oneOf(...targetIds);
            }
        }

        const { count, rows } = await LhcPeriodStatisticsRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length, // When using grouping sequelize returns from finAndCountAll counts per each group
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
            .includeAttribute({
                query: (sequelize) => sequelize.fn('COUNT', sequelize.fn('distinct', sequelize.col('lhcPeriod->runs.run_number'))),
                alias: 'runsCount',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->dataPasses.id'))),
                alias: 'dataPassesCount',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->runs.lhc_beam_energy'))),
                alias: 'distinctEnergies',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->runs.pdp_beam_type'))),
                alias: 'beamTypes',
            })
            .include({
                association: 'lhcPeriod',
                include: [
                    {
                        association: 'runs',
                        attributes: [],
                        where: {
                            definition: RunDefinition.Physics,
                            runQuality: RunQualities.GOOD,
                        },
                        required: false,
                    },
                    {
                        association: 'dataPasses',
                        attributes: [],
                        required: false,
                    },
                ],
                required: true,
            })
            .groupBy('id');
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
