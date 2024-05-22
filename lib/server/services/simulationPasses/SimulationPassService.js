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

const { repositories: { SimulationPassRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource');
const { simulationPassAdapter } = require('../../../database/adapters');
const { Op } = require('sequelize');
const { getOneSimulationPass } = require('./getOneSimulationPass.js');
const { getOneSimulationPassOrFail } = require('./getOneSimulationPassOrFail.js');

/**
 * @typedef SimulationPassIdentifier
 * @param {number} [id]
 * @param {string} [name]
 */

/**
 * Simulation Pass Service
 */
class SimulationPassService {
    /**
     * Return one Simulation Pass
     * @param {SimulationPassIdentifier} identifier identifier of Simulation Pass
     * @return {SimulationPass} a Simulation Pass
     */
    async getByIdentifier(identifier) {
        const simulationPass = await getOneSimulationPass(identifier, this.prepareQueryBuilder);
        return simulationPass ? simulationPassAdapter.toEntity(simulationPass) : null;
    }

    /**
     * Find an Simulation Pass by its name or id
     * @param {SimulationPassIdentifier} identifier the criteria to find Simulation Pass
     * @throws {NotFoundError} in case there is no Simulation Pass with given identifier
     * @return {Promise<SimulationPass>} a Simulation Pass
     */
    async getOneOrFail(identifier) {
        return simulationPassAdapter.toEntity(await getOneSimulationPassOrFail(identifier, this.prepareQueryBuilder));
    }

    /**
     * Get all Simulation Passes
     * @param {object|undefined} options define which records should be fetched
     * @param {object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.ids] Simulation Passes id's to filter with
     * @param {string[]} [options.filter.names] Simulation Passes names to filter with
     * @param {number[]} [options.filter.lhcPeriodIds] If specified, restrict simulation passes
     * to the ones linked to one of the LHC Periods represented by these ids
     * @param {number[]} [options.filter.dataPassIds] If specified, restrict simulation passes
     * to the ones linked to one of the data-pass represented by these ids
     * @param {number} [options.offset] Offset of the first simulation pass returned
     * @param {number} [options.limit] Maximal amount of returned simulation passes
     * @param {object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting -
     * array of mappings of field name to order type
     * @returns {Promise<CountedItems<SimulationPass>>} result
     */
    async getAll({
        filter,
        limit,
        offset,
        sort,
    } = {}) {
        const queryBuilder = this.prepareQueryBuilder();

        if (sort) {
            for (const property in sort) {
                queryBuilder.orderBy(property, sort[property]);
            }
        }

        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }

        if (filter) {
            const { ids, names, lhcPeriodIds, dataPassIds } = filter;
            if (lhcPeriodIds) {
                const associatedIds = (await SimulationPassRepository.findAll({
                    raw: true,
                    include: {
                        association: 'dataPasses',
                        where: { lhcPeriodId: { [Op.in]: lhcPeriodIds } },
                    },
                })).map(({ id }) => id);
                queryBuilder.where('id').oneOf(...associatedIds);
            }
            if (dataPassIds) {
                const associatedIds = (await SimulationPassRepository.findAll({
                    raw: true,
                    include: {
                        association: 'dataPasses',
                        where: { id: { [Op.in]: dataPassIds } },
                    },
                })).map(({ id }) => id);
                queryBuilder.where('id').oneOf(...associatedIds);
            }
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                queryBuilder.where('name').oneOf(...names);
            }
        }

        const { count, rows } = await SimulationPassRepository.findAndCountAll(queryBuilder);

        return {
            count: count.length, // With GROUP-BY clause, findAndCountAll method returns list of counts per each grouping
            rows: rows.map(simulationPassAdapter.toEntity),
        };
    }

    /**
     * Prepare common fetch data query builder (create a new one if none is provided)
     *
     * @param {QueryBuilder|null} [queryBuilder=null] if specified, an existing query builder that will be reused
     * @return {QueryBuilder} the prepared query builder
     */
    prepareQueryBuilder(queryBuilder = null) {
        return (queryBuilder ?? dataSource.createQueryBuilder())
            .set('subQuery', false)
            .includeAttribute({
                query: (sequelize) => sequelize.fn('count', sequelize.fn('distinct', sequelize.col('runs.run_number'))),
                alias: 'runsCount',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('count', sequelize.fn('distinct', sequelize.col('dataPasses.id'))),
                alias: 'dataPassesCount',
            })
            .include({
                association: 'runs',
                through: { attributes: [] },
                attributes: [],
            })
            .include({
                association: 'dataPasses',
                through: { attributes: [] },
                attributes: [],
            })
            .groupBy('id');
    }
}

exports.SimulationPassService = SimulationPassService;

exports.simulationPassService = new SimulationPassService();
