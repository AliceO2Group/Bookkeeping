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
const { dataPassAdapter, gaqDetectorAdapter, detectorAdapter } = require('../../../database/adapters');
const { DataPassVersionRepository, GaqDetectorRepository, RunRepository, DplDetectorRepository } = require('../../../database/repositories');
const { getOneDataPass } = require('./getOneDataPass.js');
const { getOneDataPassOrFail } = require('./getOneDataPassOrFail.js');
const { BadParameterError } = require('../../errors/BadParameterError');

/**
 * @typedef DataPassIdentifier
 * @param {number} [id]
 * @param {string} [name]
 */

/**
 * List of default GAQ detectors for pp runs
 */
const DEFAULT_GAQ_DETECTORS_FOR_PROTON_PROTON_RUNS = ['TPC', 'ITS', 'FT0'];

/**
 * List of default GAQ detectors for PbPb runs
 */
const DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS = ['TPC', 'ITS', 'FT0', 'ZDC'];

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
     * Set list of DPL detectors which flags contribute to GAQ (global aggregated quality)
     * for given runs and data pass
     *
     * @param {number} dataPassId data pass id
     * @param {number[]} runNumbers list of run numbers
     * @param {number[]} detectorIds list of ids of DPL detectors included in GAQ computation for the given runs and data pass
     * @return {Promise<void>} promise resolved once association between data pass, runs and detectors was set
     */
    async setGaqDetectors(dataPassId, runNumbers, detectorIds) {
        return dataSource.transaction(async () => {
            await getOneDataPassOrFail({ id: dataPassId });
            await this._verifyDataPassAndRunsAssociation(dataPassId, runNumbers);
            await this._verifyRunsAndDplDetectorsAssociations(runNumbers, detectorIds);

            await GaqDetectorRepository.removeAll({
                where: {
                    dataPassId,
                    runNumber: { [Op.in]: runNumbers },
                },
            });
            const gaqEntries = runNumbers
                .flatMap((runNumber) => detectorIds
                    .map((detectorId) => ({ dataPassId, runNumber, detectorId })));
            const createdEntries = await GaqDetectorRepository.insertAll(gaqEntries);
            return createdEntries.map(gaqDetectorAdapter.toEntity);
        });
    }

    /**
     * Set default list of DPL detectors which flags contribute to GAQ (global aggregated quality) for given runs and data pass
     * Where, for given run, default list of GAQ detectors is intersection of detectors linked to it with list of detectors
     *  from @see DEFAULT_GAQ_DETECTORS_FOR_PDP_BEAM_TYPE, which depends on beam type of the run
     *
     * @param {number} dataPassId data pass id
     * @param {number[]} runNumbers list of run numbers
     * @param {object} [options] additional options
     * @param {sequelize.Transaction} [options.transaction] sequelize transaction
     * @return {Promise<void>} promise resolved once association between data pass, runs and detectors was set
     */
    useDefaultGaqDetectors(dataPassId, runNumbers, { transaction } = {}) {
        return dataSource.transaction(async () => {
            await getOneDataPassOrFail({ id: dataPassId });
            await this._verifyDataPassAndRunsAssociation(dataPassId, runNumbers);

            await GaqDetectorRepository.removeAll({
                where: {
                    dataPassId,
                    runNumber: { [Op.in]: runNumbers },
                },
            });

            const runsWithDetectors = await RunRepository.findAll({
                where: { runNumber: { [Op.in]: runNumbers } },
                include: [
                    {
                        association: 'detectors',
                        where: { [Op.or]: [
                            { '$Run.pdp_beam_type$': 'pp', name: { [Op.in]: DEFAULT_GAQ_DETECTORS_FOR_PROTON_PROTON_RUNS } },
                            { '$Run.pdp_beam_type$': 'PbPb', name: { [Op.in]: DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS } },
                        ] },
                    },
                ],
            });

            const gaqEntries = runsWithDetectors
                .flatMap(({ runNumber, detectors }) => detectors
                    .map(({ id: detectorId }) => ({ dataPassId, runNumber, detectorId })));
            const createdEntries = await GaqDetectorRepository.insertAll(gaqEntries);
            return createdEntries.map(gaqDetectorAdapter.toEntity);
        }, { transaction });
    }

    /**
     * Find DPL detectors which flags contribute to GAQ for given run and data pass
     *
     * @param {number} dataPassId id of data pass
     * @param {number} runNumber run number
     * @return {Promise<Partial<DplDetector>[]>} promise of DPL detectors
     */
    async getGaqDetectors(dataPassId, runNumber) {
        const queryBuilder = dataSource.createQueryBuilder()
            .where('dataPassId').is(dataPassId)
            .where('runNumber').is(runNumber)
            .include({ association: 'detector' })
            .orderBy((sequelize) => sequelize.col('`detector`.name'), 'ASC');

        const gaqDetectors = await GaqDetectorRepository.findAll(queryBuilder);
        return gaqDetectors.map(({ detector }) => detectorAdapter.toMinifiedEntity(detector));
    }

    /**
     * Verify associations between data pass and runs exist
     *
     * @param {number} dataPassId id of a data pass
     * @param {number[]} runNumbers list of run numbers
     * @return {Promise<void>} promise resolved once associations are validated
     * @throws {BadParameterError} if some association does not exist
     */
    async _verifyDataPassAndRunsAssociation(dataPassId, runNumbers) {
        const validRunNumbers = await RunRepository.findAll({
            attributes: ['runNumber'],
            where: { runNumber: { [Op.in]: runNumbers } },
            include: [{ association: 'dataPass', where: { id: dataPassId }, required: true }],
        });
        const validRunNumbersSet = new Set(validRunNumbers.map(({ runNumber }) => runNumber));
        const invalidRunNumbers = runNumbers.filter((runNumber) => !validRunNumbersSet.has(runNumber));
        if (invalidRunNumbers.length > 0) {
            const errorMessage = `No association between data pass with id ${dataPassId} and following runs: ${invalidRunNumbers}`;
            throw new BadParameterError(errorMessage);
        }
    }

    /**
     * Verify that all the given runs includes each of the given detectors
     * As there is no direct link between runs and DPL detectors,
     *  association between run and corresponding Detector (with same name as DPL Detector) is checked
     *
     * @param {number[]} runNumbers list of run numbers
     * @param {number[]} detectorIds list of IDs of DPL detectors
     * @return {Promise<void>} promise resolved once associations are validated
     * @throws {BadParameterError} if some association does not exist
     */
    async _verifyRunsAndDplDetectorsAssociations(runNumbers, detectorIds) {
        const dplDetectors = await DplDetectorRepository.findAll({
            attributes: ['id', 'name'],
            where: { id: { [Op.in]: detectorIds } },
        });
        const validDetectorIdsSet = new Set(dplDetectors.map(({ id }) => id));
        const invalidIds = detectorIds.filter((detectorId) => !validDetectorIdsSet.has(detectorId));
        if (invalidIds.length > 0) {
            throw new BadParameterError(`No DPL detectors with IDs: (${invalidIds})`);
        }
        const validDetectorNames = dplDetectors.map(({ name }) => name);

        const runAndDetector = (await RunRepository.findAll({
            attributes: ['runNumber'],
            where: { runNumber: { [Op.in]: runNumbers } },
            include: [
                {
                    association: 'detectors',
                    attributes: ['name'],
                    where: { name: { [Op.in]: validDetectorNames } },
                    through: { attributes: [] },
                    required: false,
                },
            ],
        })).map(({ runNumber, detectors }) => [runNumber, detectors.map(({ name }) => name)]);

        const validRunToDetectors = Object.fromEntries(runAndDetector);

        const missingRunDetectorAssociations = runNumbers
            .map((runNumber) => [
                runNumber,
                validDetectorNames.filter((detectorName) => !validRunToDetectors[runNumber]?.includes(detectorName)),
            ])
            .filter(([_, missingDetectors]) => missingDetectors.length > 0);

        if (missingRunDetectorAssociations.length > 0) {
            const errorMessage = `No association between runs and detectors: ${JSON.stringify(missingRunDetectorAssociations)}`;
            throw new BadParameterError(errorMessage);
        }
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
