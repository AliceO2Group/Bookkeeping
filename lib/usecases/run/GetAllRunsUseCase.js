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

const { repositories: { RunRepository }, utilities: { QueryBuilder } } = require('../../database');

const { runAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { EorReasonRepository } = require('../../database/repositories');
const { PhysicalConstant } = require('../../domain/enums/PhysicalConstant');
const { BadParameterError } = require('../../server/errors/BadParameterError');
const { gaqService } = require('../../server/services/qualityControlFlag/GaqService.js');
const { qcFlagSummaryService } = require('../../server/services/qualityControlFlag/QcFlagSummaryService.js');

/**
 * GetAllRunsUseCase
 */
class GetAllRunsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllRuns DTO which contains all request data.
     * @return {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const filteringQueryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { filter, page = {}, sort = { runNumber: 'desc' } } = query;

        const SEARCH_ITEMS_SEPARATOR = ',';

        if (filter) {
            const {
                calibrationStatuses,
                dcs,
                ddflp,
                definitions,
                detectors: detectorFilter,
                environmentIds,
                eorReason,
                epn,
                fillNumbers,
                lhcPeriods,
                lhcPeriodIds,
                dataPassIds,
                simulationPassIds,
                nDetectors,
                nEpns,
                nFlps,
                ctfFileCount,
                tfFileCount,
                otherFileCount,
                o2end,
                o2start,
                odcTopologyFullName,
                runDuration,
                runNumbers,
                runQualities,
                runTypes,
                tags,
                triggerValues,
                magnets,
                updatedAt,
                muInelasticInteractionRate,
                inelasticInteractionRateAvg,
                inelasticInteractionRateAtStart,
                inelasticInteractionRateAtMid,
                inelasticInteractionRateAtEnd,
                gaq,
                detectorsQc,
            } = filter;

            if (runNumbers) {
                const runNumberCriteria = runNumbers.split(SEARCH_ITEMS_SEPARATOR)
                    .map((runNumbers) => runNumbers.trim())
                    .filter(Boolean);

                const runNumberSet = new Set();

                runNumberCriteria.forEach((runNumber) => {
                    if (runNumber.includes('-')) {
                        const [start, end] = runNumber.split('-').map((n) => parseInt(n, 10));
                        if (!Number.isNaN(start) && !Number.isNaN(end)) {
                            for (let i = start; i <= end; i++) {
                                runNumberSet.add(i);
                            }
                        }
                    } else {
                        const parsedRunNumber = parseInt(runNumber, 10);
                        if (!Number.isNaN(parsedRunNumber)) {
                            runNumberSet.add(parsedRunNumber);
                        }
                    }
                });

                const finalRunNumberList = Array.from(runNumberSet);

                // Check that the final run numbers list contains at least one valid run number
                if (finalRunNumberList.length > 0) {
                    // Check if user provided more than 1 run number initially, it might be twice the same to disable the `LIKE` filtering
                    if (finalRunNumberList.length > 1 || runNumberCriteria.length > 1) {
                        filteringQueryBuilder.where('runNumber').oneOf(...finalRunNumberList);
                    } else {
                        const [runNumber] = finalRunNumberList;
                        filteringQueryBuilder.where('runNumber').substring(`${runNumber}`);
                    }
                }
            }

            if (calibrationStatuses) {
                filteringQueryBuilder.where('calibrationStatus').oneOf(...calibrationStatuses);
            }

            if (runTypes) {
                filteringQueryBuilder.where('runTypeId').oneOf(...runTypes);
            }

            if (definitions) {
                filteringQueryBuilder.where('definition').oneOf(...definitions);
            }

            if (eorReason) {
                const eorReasonTypeWhere = {};
                if (eorReason.category) {
                    eorReasonTypeWhere.category = { [Op.eq]: eorReason.category };
                }
                if (eorReason.title) {
                    eorReasonTypeWhere.title = { [Op.eq]: eorReason.title };
                }
                if (!eorReason.description) {
                    eorReason.description = '';
                }

                const eorReasonsWithCategory = await EorReasonRepository.findAll({
                    attributes: ['runId'],
                    ...eorReason.description && { where: { description: { [Op.substring]: eorReason.description } } },
                    include: {
                        association: 'reasonType',
                        where: eorReasonTypeWhere,
                    },
                });
                filteringQueryBuilder.where('id').oneOf(...eorReasonsWithCategory.map(({ runId }) => runId));
            }

            if (fillNumbers) {
                // Search for multiple exact ids
                const fillNumbersList = fillNumbers
                    .split(SEARCH_ITEMS_SEPARATOR)
                    .map((fillNumber) => fillNumber.trim())
                    .filter((fillNumber) => parseInt(fillNumber, 10));
                filteringQueryBuilder.where('fillNumber').oneOf(...fillNumbersList);
            }

            if (o2start) {
                const from = o2start.from !== undefined ? o2start.from : 0;
                const to = o2start.to !== undefined ? o2start.to : new Date().getTime();
                filteringQueryBuilder.where('timeO2Start').between(from, to);
            }

            if (o2end) {
                const from = o2end.from !== undefined ? o2end.from : 0;
                const to = o2end.to !== undefined ? o2end.to : new Date().getTime();
                filteringQueryBuilder.where('timeO2End').between(from, to);
            }

            if (updatedAt) {
                const from = updatedAt.from ?? 0;
                const to = updatedAt.to ?? new Date().getTime();
                filteringQueryBuilder.where('updatedAt').between(from, to);
            }

            if (triggerValues) {
                filteringQueryBuilder.where('triggerValue').oneOf(...triggerValues);
            }

            if (magnets) {
                const { l3: aliceL3Current, dipole: aliceDipoleCurrent } = magnets;
                if (aliceL3Current !== undefined) {
                    /**
                     * The alice l3 current computed from its absolute value and polarity
                     * @param {function} literal function to create an object representing a database literal expression
                     * @return {Object} the object representing the column
                     */
                    const computedColumn = ({ literal }) =>
                        literal('ROUND(alice_l3_current * IF(`alice_l3_polarity` = \'NEGATIVE\', -1, 1) / 1000)');
                    filteringQueryBuilder.where(computedColumn).is(aliceL3Current);
                }
                if (aliceDipoleCurrent !== undefined) {
                    /**
                     * The alice dipole current computed from its absolute value and polarity
                     * @param {function} literal function to create an object representing a database literal expression
                     * @return {Object} the object representing the column
                     */
                    const computedColumn = ({ literal }) =>
                        literal('ROUND(alice_dipole_current * IF(`alice_dipole_polarity` = \'NEGATIVE\', -1, 1) / 1000)');
                    filteringQueryBuilder.where(computedColumn).is(aliceDipoleCurrent);
                }
            }

            if (muInelasticInteractionRate) {
                const { operator, limit: muInelasticInteractionRateValue } = muInelasticInteractionRate;

                /**
                 * The computed mu of inelastic interaction rate
                 *
                 * @param {function} literal function to create an object representing a database literal expression
                 * @return {Object} the object representing the column
                 */
                const computedColumn = ({ literal }) =>
                    literal(`\`Run\`.\`inelastic_interaction_rate_avg\` / (
                        SUBSTRING_INDEX(SUBSTRING_INDEX(\`lhcFill\`.\`filling_scheme_name\`, '_', 4), '_', -1) 
                        * ${PhysicalConstant.LHC_REVOLUTION_FREQUENCY_HZ})
                    `);

                filteringQueryBuilder.include({ association: 'lhcFill' });
                filteringQueryBuilder.where(computedColumn).applyOperator(operator, muInelasticInteractionRateValue);
            }

            const inelFilters = {
                inelasticInteractionRateAvg,
                inelasticInteractionRateAtStart,
                inelasticInteractionRateAtMid,
                inelasticInteractionRateAtEnd,
            };
            for (const [property, inelFilterObject] of Object.entries(inelFilters)) {
                if (inelFilterObject) {
                    const { operator, limit: value } = inelFilterObject;
                    filteringQueryBuilder.where(property).applyOperator(operator, value);
                }
            }

            if (runDuration) {
                const { operator, limit: durationLimit } = runDuration;

                /**
                 * The computed duration column is based on trigger-start and trigger-end, using current timestamp as trigger-end if it is null
                 * @param {object} object object containing functions to create database objects
                 * @param {function} object.fn function to create an object representing a database function
                 * @param {function} object.col function to create an object representing a database column
                 * @param {function} object.literal function to create an object representing a database literal expression
                 *
                 * @return {Object} the object representing the column
                 */
                const computedColumn = ({ fn, col, literal }) => fn(
                    'timestampdiff',
                    literal('MICROSECOND'),
                    fn('coalesce', col('time_trg_start'), col('time_o2_start')),
                    fn('coalesce', fn('coalesce', col('time_trg_end'), col('time_o2_end')), fn('now')),
                );
                // Duration limit is handled in milliseconds by the API, but the query works on microseconds
                filteringQueryBuilder.where(computedColumn).applyOperator(operator, durationLimit * 1000);
            }

            if (environmentIds) {
                // Search for multiple exact ids
                const environmentIdList = environmentIds
                    .split(SEARCH_ITEMS_SEPARATOR)
                    .map((environmentId) => environmentId.trim())
                    .filter((environmentId) => Boolean(environmentId));
                filteringQueryBuilder.where('environmentId').oneOf(...environmentIdList);
            }

            if (runQualities) {
                filteringQueryBuilder.where('runQuality').oneOf(...runQualities);
            }

            const fileCountFilters = [
                { field: 'nDetectors', value: nDetectors },
                { field: 'nFlps', value: nFlps },
                { field: 'nEpns', value: nEpns },
                { field: 'ctfFileCount', value: ctfFileCount },
                { field: 'tfFileCount', value: tfFileCount },
                { field: 'otherFileCount', value: otherFileCount },
            ];
            fileCountFilters.forEach(({ field, value }) => {
                if (value) {
                    const { operator, limit } = value;
                    filteringQueryBuilder.where(field).applyOperator(operator, limit);
                }
            });

            if (ddflp === false) {
                filteringQueryBuilder.where('dd_flp').isOrNull(ddflp);
            } else if (ddflp === true) {
                filteringQueryBuilder.where('dd_flp').is(ddflp);
            }

            if (dcs === false) {
                filteringQueryBuilder.where('dcs').isOrNull(dcs);
            } else if (dcs === true) {
                filteringQueryBuilder.where('dcs').is(dcs);
            }

            if (epn === false) {
                filteringQueryBuilder.where('epn').isOrNull(false);
            } else if (epn === true) {
                filteringQueryBuilder.where('epn').is(true);
            }

            if (odcTopologyFullName) {
                filteringQueryBuilder.where('odcTopologyFullName').substring(odcTopologyFullName);
            }

            if (detectorFilter) {
                const { operator: detectorsOperator, values: detectorsValues } = detectorFilter;
                switch (detectorsOperator) {
                    case 'none':
                        filteringQueryBuilder.where('concatenatedDetectors').isOrNull('');
                        break;
                    case 'and':
                        filteringQueryBuilder.where('concatenatedDetectors')
                            .allOfSubstrings(detectorsValues.split(',').map((detector) => detector.trim()));
                        break;
                    case 'or':
                        filteringQueryBuilder.where('concatenatedDetectors')
                            .oneOfSubstrings(detectorsValues.split(',').map((detector) => detector.trim()));
                        break;
                }
            }

            if (lhcPeriods) {
                // Search for multiple exact ids
                const lhcPeriodsList = lhcPeriods
                    .split(SEARCH_ITEMS_SEPARATOR)
                    .map((lhcPeriod) => lhcPeriod.trim());

                filteringQueryBuilder.include({
                    association: 'lhcPeriod',
                    where: {
                        name: { [Op.in]: lhcPeriodsList },
                    },
                });
            }

            if (dataPassIds) {
                const runNumbers = (await RunRepository.findAll({
                    attributes: ['runNumber'],
                    raw: true,
                    include: [
                        {
                            association: 'dataPass',
                            where: { id: { [Op.in]: dataPassIds } },
                        },
                    ],
                })).map(({ runNumber }) => runNumber);
                filteringQueryBuilder.where('runNumber').oneOf(...runNumbers);
            }

            const badEffectiveRunCoverageComparison = (badEffectiveRunCoverage, operator, value) => {
                switch (operator) {
                    case '<':
                        return 1 - badEffectiveRunCoverage < value;
                    case '<=':
                        return 1 - badEffectiveRunCoverage <= value;
                    case '=':
                        return 1 - badEffectiveRunCoverage === value;
                    case '>':
                        return 1 - badEffectiveRunCoverage > value;
                    case '>=':
                        return 1 - badEffectiveRunCoverage >= value;
                }
            };

            if (gaq) {
                if ((dataPassIds ?? []).length !== 1) {
                    throw new BadParameterError('Filtering by GAQ is enabled only when filtering with one dataPassId');
                }
                const { mcReproducibleAsNotBad = false } = gaq;
                const [dataPassId] = dataPassIds;
                const gaqSummary = await gaqService.getSummary(dataPassId, { mcReproducibleAsNotBad });

                if (gaq.notBadFraction) {
                    const { operator, limit: value } = gaq.notBadFraction;
                    const runNumbers = Object.entries(gaqSummary)
                        .filter(([_, { badEffectiveRunCoverage }]) =>
                            badEffectiveRunCoverageComparison(badEffectiveRunCoverage, operator, value))
                        .map(([runNumber]) => runNumber);
                    filteringQueryBuilder.where('runNumber').oneOf(...runNumbers);
                }
            }

            if (detectorsQc) {
                const [dataPassId] = dataPassIds ?? [];
                const [simulationPassId] = simulationPassIds ?? [];
                const [lhcPeriodId] = lhcPeriodIds ?? [];
                const { mcReproducibleAsNotBad } = detectorsQc;
                delete detectorsQc.mcReproducibleAsNotBad;

                const dplDetectorIds = Object.keys(detectorsQc).map((id) => parseInt(id.slice(1), 10));
                if (dplDetectorIds.length > 0) {
                    const qcSummary = await qcFlagSummaryService.getSummary(
                        {
                            dataPassId,
                            simulationPassId,
                            lhcPeriodId,
                            dplDetectorIds,
                        },
                        { mcReproducibleAsNotBad },
                    );

                    const runNumbers = Object.entries(qcSummary)
                        .filter(([_, runSummary]) => {
                            const mask = Object.entries(runSummary).map(([dplDetecotrId, { badEffectiveRunCoverage }]) => {
                                if (!(`_${dplDetecotrId}` in detectorsQc)) {
                                    return false;
                                }
                                const { operator: forDetectorOperator, limit } = detectorsQc[`_${dplDetecotrId}`].notBadFraction;
                                return badEffectiveRunCoverageComparison(badEffectiveRunCoverage, forDetectorOperator, limit);
                            });
                            return mask.every((valid) => valid);
                        })
                        .map(([runNumber]) => runNumber);
                    filteringQueryBuilder.where('runNumber').oneOf(...runNumbers);
                }
            }

            if (simulationPassIds) {
                const runNumbers = (await RunRepository.findAll({
                    attributes: ['runNumber'],
                    raw: true,
                    include: {
                        association: 'simulationPasses',
                        attributes: [],
                        where: { id: { [Op.in]: simulationPassIds } },
                    },
                })).map(({ runNumber }) => runNumber);
                filteringQueryBuilder.where('runNumber').oneOf(...runNumbers);
            }

            if (lhcPeriodIds) {
                const runNumbers = (await RunRepository.findAll({
                    attributes: ['runNumber'],
                    raw: true,
                    include: {
                        association: 'lhcPeriods',
                        attributes: [],
                        where: { id: { [Op.in]: lhcPeriodIds } },
                    },
                })).map(({ runNumber }) => runNumber);
                filteringQueryBuilder.where('runNumber').oneOf(...runNumbers);
            }

            if (tags?.values?.length) {
                if (tags.operation === 'and') {
                    const runsWithExpectedTags = await RunRepository.findAll({
                        attributes: ['id'],
                        include: {
                            association: 'tags',
                            where: { text: { [Op.in]: tags.values } },
                        },
                        group: 'run_number',
                        having: sequelize.literal(`count(*) = ${tags.values.length}`),
                        raw: true,
                    });
                    filteringQueryBuilder.where('id').oneOf(...runsWithExpectedTags.map(({ id }) => id));
                } else if (tags.operation === 'or') {
                    filteringQueryBuilder.include({
                        association: 'tags',
                        where: {
                            text: { [Op.in]: tags.values },
                        },
                    });
                } else {
                    const runsWithExpectedTags = await RunRepository.findAll({
                        attributes: ['id'],
                        include: {
                            association: 'tags',
                            where: { text: { [Op.in]: tags.values } },
                        },
                        group: 'run_number',
                        raw: true,
                    });
                    filteringQueryBuilder.where('id').not().oneOf(...runsWithExpectedTags.map(({ id }) => id));
                }
            }
        }

        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;
        filteringQueryBuilder.limit(limit);
        filteringQueryBuilder.offset(offset);
        filteringQueryBuilder.set('attributes', ['id', 'runNumber']);
        filteringQueryBuilder.set('raw', true);
        for (const property in sort) {
            filteringQueryBuilder.orderBy(property, sort[property]);
        }
        const { count, rows } = await RunRepository.findAndCountAll(filteringQueryBuilder);

        const fetchQueryBuilder = new QueryBuilder();
        fetchQueryBuilder.include({ association: 'runType' });
        fetchQueryBuilder.include({ association: 'lhcFill' });
        fetchQueryBuilder.include({ association: 'tags' });
        fetchQueryBuilder.include({ association: 'detectors' });
        fetchQueryBuilder.include({
            association: 'eorReasons',
            include: {
                association: 'reasonType',
                attributes: ['category', 'title'],
            },
        });
        fetchQueryBuilder.include({ association: 'lhcPeriod' });
        fetchQueryBuilder.where('id').oneOf(...rows.map(({ id }) => id));
        for (const property in sort) {
            fetchQueryBuilder.orderBy(property, sort[property]);
        }

        const runs = (await RunRepository.findAll(fetchQueryBuilder)).map(runAdapter.toEntity);

        return { count, runs };
    }
}

module.exports = GetAllRunsUseCase;
