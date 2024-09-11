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
const { DataPassVersionRepository, DataPassRunRepository } = require('../../../database/repositories');
const { getOneDataPass } = require('./getOneDataPass.js');
const { getOneDataPassOrFail } = require('./getOneDataPassOrFail.js');
const { PdpBeamType } = require('../../../domain/enums/PdpBeamType');
const { BadParameterError } = require('../../errors/BadParameterError');
const { SkimmingStage } = require('../../../domain/enums/SkimmingStage');
const { LogManager } = require('@aliceo2/web-ui');

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
     * Constructor
     */
    constructor() {
        this._logger = LogManager.getLogger('DATA_PASS_SERVICE');
    }

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
     * @return {Promise<DataPass>} the data pass found
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
     * @param {number} [options.offset] parameter related to pagination - offset
     * @param {number} [options.limit] parameter related to pagination - limit
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

        const dataPassesVersions = await DataPassVersionRepository.findAll({
            include: 'statusHistory',
            where: { dataPassId: { [Op.in]: rows.map(({ id }) => id) } },
            order: [['statusHistory', 'createdAt', 'ASC']],
        });
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
     * Set given production as skimmable
     *
     * @param {DataPassIdentifier} identifier identifier of data pass
     * @return {Promise<void>} resolved once the production was marked as skimmable
     */
    async markAsSkimmable(identifier) {
        const validSkimmableProductionNameRegex = /_apass\d+(?!.*(skimming|skimmed))/;

        return dataSource.transaction(async () => {
            const dataPass = await this.getOneOrFail(identifier);
            if (dataPass.pdpBeamType !== PdpBeamType.PROTON_PROTON) {
                throw new BadParameterError(`Cannot mark ${dataPass.name} as skimmable.`
                    + ' Only production for PROTON_PROTON runs can be marked as skimmable');
            }
            if (!validSkimmableProductionNameRegex.test(dataPass.name)) {
                throw new BadParameterError(`Cannot mark ${dataPass.name} as skimmable. Only \`apass\` can be marked as skimmable`);
            }

            const dataPassDB = await DataPassRepository.findOne({ where: { id: dataPass.id } });
            const previousSkimmable = await DataPassRepository.findOne({ where: {
                lhcPeriodId: dataPassDB.lhcPeriodId,
                skimmingStage: SkimmingStage.SKIMMABLE,
            } });
            if (previousSkimmable) {
                await DataPassRepository.update(previousSkimmable, { skimmingStage: null });
            }
            await DataPassRepository.update(dataPassDB, { skimmingStage: SkimmingStage.SKIMMABLE });
            this._logger.infoMessage(`Set ${dataPassDB.name} as skimmable` +
            `${previousSkimmable ? `, previous one was ${previousSkimmable.name}` : ''}`);
        });
    }

    /**
     * Fetch skimmable runs list with information whether they are ready for skimming
     *
     * @param {DataPassIdentifier} identifier identifier of data pass
     * @return {Promise<{ runNumber: number, readyForSkimming: boolean }[]>} list of skimmable runs with ready_for_skimming flag
     */
    async getSkimmableRuns(identifier) {
        const dataPass = await this.getOneOrFail(identifier);
        if (dataPass.skimmingStage !== SkimmingStage.SKIMMABLE) {
            throw new BadParameterError(`DataPass ${dataPass.name} is not marked as skimmable`);
        }
        const runs = await DataPassRunRepository.findAll({ where: { dataPassId: dataPass.id } });
        return runs.map(({ runNumber, readyForSkimming }) => ({ runNumber, readyForSkimming }));
    }

    /**
     * Update skimmable runs with information whether they are ready for skimming
     *
     * @param {DataPassIdentifier} identifier identifier of data pass
     * @param {{ runNumber: number, readyForSkimming: boolean }[]} runsList list of skimmable runs with ready_for_skimming flag
     * @return {Promise<{ runNumber: number, readyForSkimming: boolean }[]>} resolves with updated data
     */
    updateReadyForSkimmingRuns(identifier, runsList) {
        return dataSource.transaction(async () => {
            const dataPass = await this.getOneOrFail(identifier);
            if (dataPass.skimmingStage !== SkimmingStage.SKIMMABLE) {
                throw new BadParameterError(`DataPass ${dataPass.name} is not marked as skimmable`);
            }

            for (const { runNumber, readyForSkimming } of runsList) {
                const dataPassRun = await DataPassRunRepository.findOne({ where: { runNumber, dataPassId: dataPass.id } });
                if (!dataPassRun) {
                    throw new Error(`No association between data pass ${dataPass.name} and run ${runNumber}`);
                }
                await DataPassRunRepository.update(dataPassRun, { readyForSkimming });
            }

            return runsList;
        });
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
            .includeAttribute({
                query: (sequelize) => sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('runs.pdp_beam_type'))),
                alias: 'pdpBeamType',
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

module.exports = {
    DataPassService,
    dataPassService: new DataPassService(),
};
