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
                nDetectors,
                nEpns,
                nFlps,
                o2end,
                o2start,
                odcTopologyFullName,
                runDuration,
                runNumbers,
                runQualities,
                runTypes,
                tags,
                triggerValues,
                updatedAt,
            } = filter;

            if (runNumbers) {
                const runNumberList = runNumbers.split(SEARCH_ITEMS_SEPARATOR)
                    .filter((runNumber) => parseInt(runNumber, 10));
                filteringQueryBuilder.where('runNumber').oneOf(...runNumberList);
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
            if (runDuration) {
                const { operator, limit: durationLimit } = runDuration;

                /**
                 * The computed duration column is based on trigger-start and trigger-end, using current timestamp as trigger-end if it is null
                 *
                 * @param {function} fn function to create an object representing a database function
                 * @param {function} col function to create an object representing a database column
                 * @param {function} literal function to create an object representing a database literal expression
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
            if (nDetectors) {
                const { operator, limit: nDetectorLimit } = nDetectors;
                filteringQueryBuilder.where('nDetectors').applyOperator(operator, nDetectorLimit);
            }
            if (nFlps) {
                const { operator, limit: nFlpsLimit } = nFlps;
                filteringQueryBuilder.where('nFlps').applyOperator(operator, nFlpsLimit);
            }
            if (nEpns) {
                const { operator, limit: nEpnsLimit } = nEpns;
                filteringQueryBuilder.where('nEpns').applyOperator(operator, nEpnsLimit);
            }
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

            if (tags && tags.values.length > 0) {
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
                } else {
                    filteringQueryBuilder.include({
                        association: 'tags',
                        where: {
                            text: { [Op.in]: tags.values },
                        },
                    });
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
