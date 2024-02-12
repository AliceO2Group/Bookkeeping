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
const { BadParameterError } = require('../../errors/BadParameterError');
const { NotFoundError } = require('../../errors/NotFoundError');

/**
 * @typedef SimulationPassIdentifier
 * @param {number} id
 * @param {string} name
 */

/**
 * Simulation Pass Service
 */
class SimulationPassService {
    /**
     * Return one Simulation Pass
     * @param {SimulationPassIdentifier} identifier identifier of Simulation Pass
     * @return {DataPass} Simulation Pass
     */
    async getByIdentifier({ id, name } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();
        if (id !== null && id !== undefined) {
            queryBuilder.where('id').is(id);
        } else if (name) {
            queryBuilder.where('name').is(name);
        } else {
            throw new BadParameterError('Can not find without Simulation Pass id or name');
        }

        const simulationPass = await SimulationPassRepository.findOne(queryBuilder);
        return simulationPass ? simulationPassAdapter.toEntity(simulationPass) : null;
    }

    /**
     * Find an Simulation Pass model by its name or id
     * @param {SimulationPassIdentifier} identifier the criteria to find Simulation Pass
     * @throws {NotFoundError} in case there is no Simulation Pass with given identifier
     * @return {Promise<DataPass[]>} the dats pass found
     */
    async getOneOrFail({ id, name }) {
        const simulationPass = await this.getByIdentifier({ id, name });
        if (!simulationPass) {
            const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
            throw new NotFoundError(`Simulation Pass with this ${criteriaExpression} could not be found`);
        }
        return simulationPass;
    }

    /**
     * Get all Simulation Passes
     * @param {object|undefined} options define which records should be fetched
     * @param {object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.lhcPeriodIds] lhcPeriod identifier to filter with
     * @param {number[]} [options.filter.dataPassIds] data pass identifier to filter with
     * @param {number[]} [options.filter.ids] Simulation Passes identifier to filter with
     * @param {string[]} [options.filter.names] Simulation Passes names to filter with
     * @param {number} [options.offset] paramter related to pagination - offset
     * @param {number} [options.limit] paramter related to pagination - limit
     * @param {object<string, 'ASC'|'DESC'>[]} [options.sort] definition of sorting -
     * array of mappings of field name to order type
     * @returns {Promise<CountedItems<DataPass>>} result
     */
    async getAll({
        filter,
        limit,
        offset,
        sort,
    } = {}) {
        const queryBuilder = dataSource.createQueryBuilder();

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
                queryBuilder.whereAssociation('dataPasses', 'lhcPeriodId').oneOf(...lhcPeriodIds);
            }
            if (dataPassIds) {
                queryBuilder.whereAssociation('dataPasses', 'id').oneOf(...dataPassIds);
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
            count,
            rows: rows.map(simulationPassAdapter.toEntity),
        };
    }
}

exports.SimulationPassService = SimulationPassService;

exports.simulationPassService = new SimulationPassService();
