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
const { repositories: { DataPassRepository, LhcPeriodRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { dataPassAdapter } = require('../../../database/adapters');
const { DataPassVersionRepository } = require('../../../database/repositories');
const { getOneDataPass } = require('./getOneDataPass.js');
const { getOneDataPassOrFail } = require('./getOneDataPassOrFail.js');

/**
 * @typedef DataPassIdentifier
 * @param {number} [id]
 * @param {string} [name]
 */

/**
 * Data Pass Service
 */
class DataPassService {
    /**
     * Return one data pass
     * @param {DataPassIdentifier} identifier identifier of data pass
     * @return {DataPass} data pass
     */
    async getByIdentifier(identifier) {
        const dataPass = await getOneDataPass(identifier, this.prepareQueryBuilder);
        return dataPass ? dataPassAdapter.toEntity(dataPass) : null;
    }

    /**
     * Find a Data Pass model by its name or id
     * @param {DataPassIdentifier} identifier the criteria to find data pass
     * @throws {NotFoundError} in case there is no Data Pass with given identifier
     * @return {Promise<DataPass>} the dats pass found
     */
    async getOneOrFail(identifier) {
        return dataPassAdapter.toEntity(await getOneDataPassOrFail(identifier, this.prepareQueryBuilder));
    }

    /**
     * Get full name of data pass for given suffix and LHC period which given run belongs to
     *
     * @param {string} partialDataPassName data pass name without LHC period name, e.g. apass1, cpass0
     * @param {number} runNumber run number
     * @return {string} data pass name
     */
    async getFullDataPassNameUsingRunPeriod(partialDataPassName, runNumber) {
        const lhcPeriods = await LhcPeriodRepository.findOne({ include: [{ association: 'runs', where: { runNumber } }] });
        if (!lhcPeriods) {
            throw new Error(`Missing LHC Period information for run (${runNumber})`);
        }

        return `${lhcPeriods.name}_${partialDataPassName}`;
    }

    /**
     * Get all data passes
     * @param {object} [options={}] define which records should be fetched
     * @param {object} [options.filter] definition of filtering
     * @param {number[]} [options.filter.lhcPeriodIds] lhcPeriod identifier to filter with
     * @param {number[]} [options.filter.simulationPassIds] simulationPass identifier to filter with
     * @param {number[]} [options.filter.ids] data passes identifier to filter with
     * @param {string[]} [options.filter.names] data passes names to filter with
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
            const { ids, names, lhcPeriodIds, simulationPassIds } = filter;
            if (lhcPeriodIds) {
                queryBuilder.where('lhcPeriodId').oneOf(...lhcPeriodIds);
            }
            if (simulationPassIds) {
                queryBuilder.whereAssociation('anchoredSimulationPasses', 'id').oneOf(...simulationPassIds);
            }
            if (ids) {
                queryBuilder.where('id').oneOf(...ids);
            }
            if (names) {
                queryBuilder.where('name').oneOf(...names);
            }
        }

        const { count, rows } = await DataPassRepository.findAndCountAll(queryBuilder);

        const dataPassesVersions = await DataPassVersionRepository.findAll({ where: { dataPassId: { [Op.in]: rows.map(({ id }) => id) } } });
        const dataPassIdToVersions = dataPassesVersions.reduce((acc, version) => {
            const { dataPassId } = version;
            acc[dataPassId] = [...acc[dataPassId] ?? [], version];
            return acc;
        }, {});

        for (const dataPass of rows) {
            dataPass.versions = dataPassIdToVersions[dataPass.id];
        }

        return {
            count: count.length, // When using grouping sequelize returns from finAndCountAll counts per each group
            rows: rows.map(dataPassAdapter.toEntity),
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
                query: (sequelize) => sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('`runs.run_number'))),
                alias: 'runsCount',
            })
            .includeAttribute({
                query: (sequelize) => sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('anchoredSimulationPasses.id'))),
                alias: 'simulationPassesCount',
            })
            .include({
                association: 'runs',
                attributes: [],
                required: false,
            })
            .include({
                association: 'anchoredSimulationPasses',
                attributes: [],
                required: false,
            })
            .include({ association: 'versions', attributes: [], required: true })
            .groupBy('`DataPass`.id');
    }
}

exports.DataPassService = DataPassService;

exports.dataPassService = new DataPassService();
