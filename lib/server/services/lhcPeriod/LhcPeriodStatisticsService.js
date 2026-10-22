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
const { dataSource } = require('../../../database/DataSource.js');
const { lhcPeriodStatisticsAdapter } = require('../../../database/adapters');
const { RunQualities } = require('../../../domain/enums/RunQualities.js');
const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');
const { NonPhysicsProductionsNamesWords } = require('../../../domain/enums/NonPhysicsProductionsNamesWords.js');
const { getAllLhcPeriodStatistics } = require('./getAllLhcPeriodStatistics.js');
const { getLhcPeriodStatistics } = require('./getLhcPeriodStatistics.js');
const { getLhcPeriodStatisticsIdsByPdpBeamTypes } = require('./getLhcPeriodStatisticsIdsByPdpBeamTypes.js');
const { getLhcPeriodStatisticsOrFail } = require('./getLhcPeriodStatisticsOrFail.js');

const sortExpressionMap = {
    name: (sequelize) => sequelize.col('`lhcPeriod`.`name`'),
    year: (sequelize) => sequelize.literal('SUBSTRING(lhcPeriod.name, 4, 2)'),
    pdpBeamTypes: (sequelize) => sequelize.literal('pdpBeamTypes'),
};

/**
 * LhcPeriodStatisticsService
 */
class LhcPeriodStatisticsService {
    /**
     * Find the statistics of an LHC period by the id or the name of the period
     *
     * @param {LhcPeriodIdentifier} identifier the criteria to find the LHC period statistics
     * @return {Promise<LhcPeriodStatistics|null>} the LHC period statistics found or null
     */
    async getByIdentifier(identifier) {
        const lhcPeriodStatistics = await getLhcPeriodStatistics(identifier, (queryBuilder) => this.prepareQueryBuilder(queryBuilder));
        return lhcPeriodStatistics ? lhcPeriodStatisticsAdapter.toEntity(lhcPeriodStatistics) : null;
    }

    /**
     * Find the statistics of an LHC period by the id or the name of the period
     *
     * @param {LhcPeriodIdentifier} identifier the criteria to find the LHC period statistics
     * @throws {NotFoundError} in case there is no LHC Period with given identifier
     * @return {Promise<LhcPeriodStatistics>} the LHC period statistics found
     */
    async getOneOrFail(identifier) {
        const lhcPeriodStatistics = await getLhcPeriodStatisticsOrFail(identifier, (queryBuilder) => this.prepareQueryBuilder(queryBuilder));
        return lhcPeriodStatisticsAdapter.toEntity(lhcPeriodStatistics);
    }

    /**
     * Get all lhc periods with statistics
     * @param {Object|undefined} options define which records should be fetched
     * @param {Object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.ids] lhcPeriod identifier to filter with
     * @param {string[]} [options.filter.names] lhcPeriod names to filter with
     * @param {number} [options.offset] parameter related to pagination - offset
     * @param {number} [options.limit] parameter related to pagination - limit
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
        const { ids, names, years, pdpBeamTypes } = filter ?? {};
        const pdpBeamTypesStatisticsIds = pdpBeamTypes ? await getLhcPeriodStatisticsIdsByPdpBeamTypes(pdpBeamTypes) : null;

        const { count, rows } = await getAllLhcPeriodStatistics((queryBuilder) => {
            this.prepareQueryBuilder(queryBuilder);

            if (sort) {
                for (const property in sort) {
                    const expression = sortExpressionMap[property];
                    queryBuilder.orderBy(expression ?? property, sort[property]);
                }
            }

            if (limit) {
                queryBuilder.limit(limit);
            }
            if (offset) {
                queryBuilder.offset(offset);
            }

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
            if (pdpBeamTypesStatisticsIds) {
                queryBuilder.where('id').oneOf(...pdpBeamTypesStatisticsIds);
            }
        });

        return {
            count: count.length, // When using grouping sequelize returns from finAndCountAll counts per each group
            rows: rows.map(lhcPeriodStatisticsAdapter.toEntity),
        };
    }

    /**
     * Prepare common fetch data query builder (create a new one if none is provided)
     *
     * @param {QueryBuilder|null} [queryBuilder=null] if specified, an existing query builder that will be reused
     * @return {QueryBuilder} query builder with common includes
     */
    prepareQueryBuilder(queryBuilder = null) {
        return (queryBuilder ?? dataSource.createQueryBuilder())
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
                query: (sequelize) => sequelize.fn(
                    'COUNT',
                    sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->dataPasses->anchoredSimulationPasses.id')),
                ),
                alias: 'simulationPassesCount',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->runs.lhc_beam_energy'))),
                alias: 'distinctEnergies',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('lhcPeriod->runs.pdp_beam_type'))),
                alias: 'pdpBeamTypes',
            })
            .include({
                association: 'lhcPeriod',
                include: [
                    {
                        association: 'runs',
                        attributes: [],
                        where: {
                            definition: RunDefinition.PHYSICS,
                            runQuality: RunQualities.GOOD,
                        },
                        required: false,
                    },
                    {
                        association: 'dataPasses',
                        attributes: [],
                        required: false,

                        where: {
                            name: { [Op.and]: [
                                { [Op.notLike]: `%\\_${NonPhysicsProductionsNamesWords.TEST}%` },
                                { [Op.notLike]: `%\\_${NonPhysicsProductionsNamesWords.DEBUG}%` },
                            ] },
                        },

                        include: [
                            {
                                association: 'anchoredSimulationPasses',
                                attributes: [],
                                required: false,
                            },
                        ],
                    },
                ],
                required: true,
            })
            .groupBy('id');
    }
}

exports.LhcPeriodStatisticsService = LhcPeriodStatisticsService;

exports.lhcPeriodStatisticsService = new LhcPeriodStatisticsService();
