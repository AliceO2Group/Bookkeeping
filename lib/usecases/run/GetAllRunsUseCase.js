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

const {
    repositories: {
        RunRepository,
        RunTagsRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');
const { RunAdapter } = require('../../database/adapters');
const { groupByProperty } = require('../../database/utilities/groupByProperty.js');
const { getTagsByTextUseCase } = require('../tag/getTagsByTextUseCase.js');
const { COSMIC_OR_PHYSICS_TF_BUILDER_MODE, RunDefinition } = require('../../services/getRunDefinition.js');
const { Op } = require('sequelize');
const { TagRepository } = require('../../database/repositories/index.js');
const { TagAdapter } = require('../../database/adapters/index.js');

/**
 * GetAllRunsUseCase
 */
class GetAllRunsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllRuns DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { filter, page = {}, sort = { runNumber: 'desc' } } = query;

        const SEARCH_ITEMS_SEPARATOR = ',';

        if (filter) {
            const {
                runNumbers,
                definitions,
                environmentIds,
                runQualities,
                triggerValues,
                fillNumbers,
                o2start,
                o2end,
                runDuration,
                nDetectors,
                nEpns,
                nFlps,
                ddflp,
                dcs,
                epn,
                odcTopologyFullName,
                detectors,
                lhcPeriods,
            } = filter;

            if (runNumbers) {
                const runNumberList = runNumbers.split(SEARCH_ITEMS_SEPARATOR)
                    .filter((runNumber) => parseInt(runNumber, 10));
                queryBuilder.where('runNumber').oneOf(...runNumberList);
            }

            if (definitions) {
                const physics = definitions.includes(RunDefinition.Physics);
                const cosmic = definitions.includes(RunDefinition.Cosmic);
                const technical = definitions.includes(RunDefinition.Technical);
                const synthetic = definitions.includes(RunDefinition.Synthetic);

                queryBuilder.andWhere(this.getRunDefinitionCriteria(physics, cosmic, technical, synthetic));
            }

            if (fillNumbers) {
                // Search for multiple exact ids
                const fillNumbersList = fillNumbers
                    .split(SEARCH_ITEMS_SEPARATOR)
                    .map((fillNumber) => fillNumber.trim())
                    .filter((fillNumber) => parseInt(fillNumber, 10));
                queryBuilder.where('fillNumber').oneOf(...fillNumbersList);
            }
            if (o2start) {
                const from = o2start.from !== undefined ? o2start.from : 0;
                const to = o2start.to !== undefined ? o2start.to : new Date().getTime();
                queryBuilder.where('timeO2Start').between(from, to);
            }
            if (o2end) {
                const from = o2end.from !== undefined ? o2end.from : 0;
                const to = o2end.to !== undefined ? o2end.to : new Date().getTime();
                queryBuilder.where('timeO2End').between(from, to);
            }
            if (triggerValues) {
                queryBuilder.where('triggerValue').oneOf(...triggerValues);
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
                    col('time_trg_start'),
                    fn('coalesce', col('time_trg_end'), fn('now')),
                );
                // Duration limit is handled in milliseconds by the API, but the query works on microseconds
                queryBuilder.where(computedColumn).applyOperator(operator, durationLimit * 1000);
            }
            if (environmentIds) {
                // Search for multiple exact ids
                const environmentIdList = environmentIds
                    .split(SEARCH_ITEMS_SEPARATOR)
                    .map((environmentId) => environmentId.trim())
                    .filter((environmentId) => Boolean(environmentId));
                queryBuilder.where('environmentId').oneOf(...environmentIdList);
            }
            if (runQualities) {
                queryBuilder.where('runQuality').oneOf(...runQualities);
            }
            if (nDetectors) {
                const { operator, limit: nDetectorLimit } = nDetectors;
                queryBuilder.where('nDetectors').applyOperator(operator, nDetectorLimit);
            }
            if (nFlps) {
                const { operator, limit: nFlpsLimit } = nFlps;
                queryBuilder.where('nFlps').applyOperator(operator, nFlpsLimit);
            }
            if (nEpns) {
                const { operator, limit: nEpnsLimit } = nEpns;
                queryBuilder.where('nEpns').applyOperator(operator, nEpnsLimit);
            }
            if (ddflp === false) {
                queryBuilder.where('dd_flp').isOrNull(ddflp);
            } else if (ddflp === true) {
                queryBuilder.where('dd_flp').is(ddflp);
            }
            if (dcs === false) {
                queryBuilder.where('dcs').isOrNull(dcs);
            } else if (dcs === true) {
                queryBuilder.where('dcs').is(dcs);
            }
            if (epn === false) {
                queryBuilder.where('epn').isOrNull(false);
            } else if (epn === true) {
                queryBuilder.where('epn').is(true);
            }
            if (odcTopologyFullName) {
                queryBuilder.where('odcTopologyFullName').substring(odcTopologyFullName);
            }
            if (detectors) {
                queryBuilder.where('detectors')
                    .allOfSubstrings(detectors.split(',').map((detector) => detector.trim()));
            }
            if (lhcPeriods) {
                // Search for multiple exact ids
                const lhcPeriodsList = lhcPeriods
                    .split(SEARCH_ITEMS_SEPARATOR)
                    .map((lhcPeriod) => lhcPeriod.trim());
                queryBuilder.where('lhcPeriod').oneOf(...lhcPeriodsList);
            }
        }

        const { limit = 100, offset = 0 } = page;

        /*
         * Duplicating = false to be able to add a query on lhcFill in the main where. Because of this, tags must be fetched in a second request
         * @see https://github.com/sequelize/sequelize/issues/12635
         */
        queryBuilder.include({ association: 'lhcFill', duplicating: false });
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        const {
            count,
            rows,
        } = await TransactionHelper.provide(async () => {
            if (filter && filter.tags && filter.tags.values.length > 0) {
                const tags = await getTagsByTextUseCase(filter.tags.values);
                const runTagQueryBuilder = new QueryBuilder()
                    .where('tagId').oneOf(...tags.map(({ id }) => id)).orderBy('runId', 'asc');

                let runIds;
                switch (filter.tags.operation) {
                    case 'and':
                        runIds = groupByProperty(await RunTagsRepository.findAll(runTagQueryBuilder), 'runId')
                            .filter(({ values }) => tags.every((tag) => values.some(({ tagId }) => tag.id === tagId)))
                            .map(({ index }) => index);
                        break;
                    case 'or':
                        runIds = (await RunTagsRepository.findAll(runTagQueryBuilder)).map(({ runId }) => runId);
                        break;
                }

                queryBuilder.where('id').oneOf(...runIds);
            }

            return RunRepository.findAndCountAll(queryBuilder);
        });

        const runs = rows.map(RunAdapter.toEntity);

        /*
         * Because duplicating = false, we need to fetch tags in another request
         * Else, the limit will apply on the result not grouped by runs (there is one line by run AND by any of its tags) and the final item
         * count will be lesser than expected
         */
        await this.fetchAndSetRunTags(runs);

        return { count, runs };
    }

    /**
     * For a given list of runs, fetch their tags and update their tag property
     *
     * @param {Object} runs the list of runs
     * @return {Promise<void>} -
     */
    async fetchAndSetRunTags(runs) {
        if (runs.length === 0) {
            return;
        }

        // Add tags
        const tagsQueryBuilder = new QueryBuilder()
            .where('$runs.id$').oneOf(runs.map(({ id }) => id))
            .include('runs');
        const tags = await TagRepository.findAll(tagsQueryBuilder);
        const tagsByRunNumber = new Map();
        tags.forEach((tag) => {
            tag.runs.forEach(({ runNumber }) => {
                if (!tagsByRunNumber.has(runNumber)) {
                    tagsByRunNumber.set(runNumber, [TagAdapter.toEntity(tag)]);
                } else {
                    tagsByRunNumber.get(runNumber).push(TagAdapter.toEntity(tag));
                }
            });
        });
        runs.forEach((run) => {
            run.tags = tagsByRunNumber.get(run.runNumber) || [];
        });
    }

    /**
     * Returns the criteria to apply to sort on the run definition
     *
     * @param {boolean} physics true to add physics run
     * @param {boolean} cosmic true to add cosmic runs
     * @param {boolean} technical true to add technical runs
     * @param {boolean} synthetic true to add synthetic runs
     * @return {Object} the criteria to add to the query builder
     */
    getRunDefinitionCriteria(physics, cosmic, technical, synthetic) {
        /*
         * Run definitions can be defined by the following criteria:
         * Run match physics or cosmic criteria ("criteriaPoC")
         *      - match physics specific criteria ("criteriaPKnowingPoC") then it is PHYSICS
         *      - DO NOT match physics specific criteria (NOT "criteriaPKnowingPoC") then it is COSMIC
         * Run DO NOT match cosmic or physics criteria (NOT "criteriaPoC")
         *      - match technical criteria ("criteriaTKnowingNotPoC") then it is TECHNICAL
         *      - DO NOT match technical criteria and match synthetic criteria ("criteriaSKnowingNotPoCoT") then it is SYNTHETIC
         * Else, run has no definition
         */

        // Criteria to match any run that is physics or cosmic
        const criteriaPoC = {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: { [Op.or]: COSMIC_OR_PHYSICS_TF_BUILDER_MODE },
            pdpWorkflowParameters: { [Op.like]: '%CTF%' },
        };

        // Criteria to match any run that is physics if we already know that it is either physics or cosmic
        const criteriaPKnowingPoC = {
            detectors: {
                [Op.or]: [
                    { [Op.like]: '%ITS%' },
                    { [Op.like]: '%FT0%' },
                ],
            },
            '$lhcFill.stable_beams_start$': {
                [Op.not]: null,
            },
        };

        // Criteria to match any run that is technical if we already know that it is not physics neither cosmic
        const criteriaTKnowingNotPoC = {
            runType: {
                [Op.and]: [
                    { [Op.not]: null },
                    { [Op.eq]: 'technical' },
                ],
            },
            pdpBeamType: {
                [Op.and]: [
                    { [Op.not]: null },
                    { [Op.eq]: 'technical' },
                ],
            },
        };

        // Criteria to match any run that is synthetic if we already know that it is not technical, physics or cosmic
        const criteriaSKnowingNotPoCoT = {
            triggerValue: 'OFF',
            readoutCfgUri: {
                [Op.and]: [
                    {
                        [Op.regexp]: '^file:///.*replay.*/cfg$',
                    },
                    {
                        [Op.regexp]: '^file:///.*(pp|pbpb).*/cfg$',
                    },
                ],
            },
            pdpWorkflowParameters: {
                [Op.notLike]: '%CTF%',
            },
        };

        const definitionCriteria = {
            [Op.or]: [],
        };

        /**
         * Add an or criteria to the current definition criteria combination
         *
         * @param {Object} criteria the criteria to adda
         * @return {void}
         */
        const orDefinitionCriteria = (criteria) => {
            definitionCriteria[Op.or].push(criteria);
        };

        if (physics || cosmic) {
            // As a default, apply physics or cosmic criteria
            let criteria = criteriaPoC;
            if (!cosmic) {
                // Apply physics or cosmic criteria AND physics knowing physics or cosmic criteria
                criteria = {
                    [Op.and]: [criteriaPoC, criteriaPKnowingPoC],
                };
            } else if (!physics) {
                // Apply physics or cosmic criteria AND NOT physics knowing physics or cosmic criteria
                criteria = {
                    [Op.and]: [
                        criteriaPoC,
                        {
                            [Op.not]: criteriaPKnowingPoC,
                        },
                    ],
                };
            }
            orDefinitionCriteria(criteria);
        }
        if (technical || synthetic) {
            if (!synthetic) {
                // Apply NOT physics or cosmic criteria AND technical knowing not physics or cosmic criteria
                orDefinitionCriteria({
                    [Op.and]: [
                        { [Op.not]: criteriaPoC },
                        criteriaTKnowingNotPoC,
                    ],
                });
            } else if (!technical) {
                /*
                 * Apply NOT physics or cosmic criteria AND NOT technical knowing not physics or cosmic criteria AND synthetic knowing not
                 * physics or synthetic or technical
                 */
                orDefinitionCriteria({
                    [Op.and]: [
                        { [Op.not]: criteriaPoC },
                        { [Op.not]: criteriaTKnowingNotPoC },
                        criteriaSKnowingNotPoCoT,
                    ],
                });
            } else {
                /*
                 * A simplification can be done to match any of the previous conditions, being either a technical or a synthetic :
                 *
                 * Apply NOT physics or cosmic criteria AND
                 *     technical knowing not physics or cosmic
                 *     OR
                 *     cosmic criteria OR synthetic knowing not physics or synthetic or technical
                 */
                orDefinitionCriteria({
                    [Op.and]: [
                        { [Op.not]: criteriaPoC },
                        {
                            [Op.or]: [
                                criteriaTKnowingNotPoC,
                                criteriaSKnowingNotPoCoT,
                            ],
                        },
                    ],
                });
            }
        }

        return definitionCriteria;
    }
}

module.exports = GetAllRunsUseCase;
