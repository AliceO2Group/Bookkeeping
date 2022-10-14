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

const { detectorAdapter } = require('../../database/adapters');
const { groupByProperty } = require('../../database/utilities/groupByProperty.js');
const { getTagsByText } = require('../../server/services/tag/getTagsByText.js');
const { COSMIC_OR_PHYSICS_TF_BUILDER_MODE, RunDefinition } = require('../../services/getRunDefinition.js');
const { Op } = require('sequelize');
const TagRepository = require('../../database/repositories/TagRepository.js');
const DetectorRepository = require('../../database/repositories/DetectorRepository.js');
const { runAdapter, tagAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');

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
                runTypes,
            } = filter;

            if (runNumbers) {
                const runNumberList = runNumbers.split(SEARCH_ITEMS_SEPARATOR)
                    .filter((runNumber) => parseInt(runNumber, 10));
                queryBuilder.where('runNumber').oneOf(...runNumberList);
            }

            if (runTypes) {
                queryBuilder.where('runTypeId').oneOf(...runTypes);
            }
            if (definitions) {
                const physics = definitions.includes(RunDefinition.Physics);
                const cosmic = definitions.includes(RunDefinition.Cosmic);
                const technical = definitions.includes(RunDefinition.Technical);
                const synthetic = definitions.includes(RunDefinition.Synthetic);
                const calibration = definitions.includes(RunDefinition.Calibration);

                queryBuilder.andWhere(this.getRunDefinitionCriteria(physics, cosmic, technical, synthetic, calibration));
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
                    fn('coalesce', col('time_trg_start'), col('time_o2_start')),
                    fn('coalesce', fn('coalesce', col('time_trg_end'), col('time_o2_end')), fn('now')),
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
        const { limit = ApiConfig.pagination.limit, offset = 0 } = page;

        queryBuilder.include({ association: 'runType', duplicating: false });

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
                const tags = await getTagsByText(filter.tags.values);
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

        const runs = rows.map(runAdapter.toEntity);

        /*
         * Because duplicating = false, we need to fetch tags in another request
         * Else, the limit will apply on the result not grouped by runs (there is one line by run AND by any of its tags) and the final item
         * count will be lesser than expected
         */
        await this.fetchAndSetRunTags(runs);
        await this.fetchAndSetRunDetectors(runs);
        return { count, runs };
    }

    /**
     * For a given list of runs, fetch their detectors and update their detector property
     *
     * @param {Object} runs the list of runs
     * @return {Promise<void>} -
     */
    async fetchAndSetRunDetectors(runs) {
        if (runs.length === 0) {
            return;
        }

        const detectorQueryBuilder = new QueryBuilder()
            .where('$runs.id$').oneOf(runs.map(({ id }) => id))
            .include('runs');
        const detectors = await DetectorRepository.findAll(detectorQueryBuilder);
        const detectorsByRunNumber = new Map();
        detectors.forEach((detector) => {
            detector.runs.forEach(({ runNumber }) => {
                if (!detectorsByRunNumber.has(runNumber)) {
                    detectorsByRunNumber.set(runNumber, [detectorAdapter.toEntity(detector)]);
                } else {
                    detectorsByRunNumber.get(runNumber).push(detectorAdapter.toEntity(detector));
                }
            });
        });
        runs.forEach((run) => {
            const runDetectors = detectorsByRunNumber.get(run.runNumber);
            run.detectors = runDetectors
                ? runDetectors.map((detector) => detector.name).join(',')
                : run.detectors;
        });
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
                    tagsByRunNumber.set(runNumber, [tagAdapter.toEntity(tag)]);
                } else {
                    tagsByRunNumber.get(runNumber).push(tagAdapter.toEntity(tag));
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
     * @param {boolean} calibration true to add calibration runs
     * @return {Object} the criteria to add to the query builder
     */
    getRunDefinitionCriteria(physics, cosmic, technical, synthetic, calibration) {
        /*
         * Run definitions can be defined by the following criteria:
         * Run match physics or cosmic criteria common criteria ("criteriaPoC")
         *      - match physics specific criteria ("criteriaPKnowingPoC") then it is PHYSICS
         *      - DO NOT match physics specific criteria (NOT "criteriaPKnowingPoC") and it match cosmic criteria (criteriaCKnowingPoCAndNotP),
         *            then it is COSMIC
         * Run DO NOT match cosmic or physics criteria (NOT "criteriaPoC")
         *      - match technical criteria ("criteriaTKnowingNotPoC") then it is TECHNICAL
         *      - DO NOT match technical criteria and match synthetic criteria ("criteriaSKnowingNotPoCoT") then it is SYNTHETIC
         * Run DO NOT match cosmic, physic, technical or synthetic
         *      - run type starts with CALIBRATION_
         * Else, run has no definition
         */

        // Common criteria between physics and cosmic runs
        const criteriaPoC = {
            dcs: true,
            dd_flp: true,
            epn: true,
            triggerValue: 'CTP',
            tfbDdMode: { [Op.or]: COSMIC_OR_PHYSICS_TF_BUILDER_MODE },
            pdpWorkflowParameters: { [Op.like]: '%CTF%' },
        };

        // Criteria to match any run that is physics if we already know that it match common criteria between physics and cosmic
        const criteriaPKnowingPoC = {
            concatenatedDetectors: {
                [Op.or]: [
                    { [Op.like]: '%ITS%' },
                    { [Op.like]: '%FT0%' },
                ],
            },
            '$lhcFill.stable_beams_start$': {
                [Op.not]: null,
            },
        };

        // Criteria to match any run that is cosmic if we already know that it match common criteria between physics or comic but is not physics
        const criteriaCKnowingPoCAndNotP = {
            '$runType.name$': {
                [Op.and]: [
                    { [Op.not]: null },
                    { [Op.in]: ['cosmic', 'cosmics'] },
                ],
            },
        };

        // Criteria to match any run that is not physics or cosmic
        const criteriaNotPoC = {
            [Op.or]: [
                { [Op.not]: criteriaPoC },
                {
                    [Op.and]: [
                        { [Op.not]: criteriaPKnowingPoC },
                        { [Op.not]: criteriaCKnowingPoCAndNotP },
                    ],
                },
            ],
        };

        // Criteria to match any run that is technical if we already know that it is not physics either cosmic
        const criteriaTKnowingNotPoC = {
            '$runType.name$': {
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
                    { [Op.not]: null },
                    {
                        [Op.regexp]: '^file:///.*replay.*/cfg$',
                    },
                    {
                        [Op.regexp]: '^file:///.*(pp|pbpb).*/cfg$',
                    },
                ],
            },
            pdpWorkflowParameters: {
                [Op.and]: [
                    { [Op.not]: null },
                    { [Op.notLike]: '%CTF%' },
                ],
            },
        };

        const criteriaCAKnowingNotPoCoToS = {
            '$runType.name$': {
                [Op.and]: [
                    { [Op.not]: null },
                    { [Op.like]: 'CALIBRATION_%' },
                ],
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

        if (physics) {
            orDefinitionCriteria({
                [Op.and]: [criteriaPoC, criteriaPKnowingPoC],
            });
        }

        if (cosmic) {
            orDefinitionCriteria({
                [Op.and]: [
                    criteriaPoC,
                    { [Op.not]: criteriaPKnowingPoC },
                    criteriaCKnowingPoCAndNotP,
                ],
            });
        }

        if (technical) {
            orDefinitionCriteria({
                [Op.and]: [
                    criteriaNotPoC,
                    criteriaTKnowingNotPoC,
                ],
            });
        }

        if (synthetic) {
            /*
             * Apply NOT physics or cosmic criteria AND NOT technical knowing not physics or cosmic criteria AND synthetic knowing not
             * physics or synthetic or technical
             */
            orDefinitionCriteria({
                [Op.and]: [
                    criteriaNotPoC,
                    { [Op.not]: criteriaTKnowingNotPoC },
                    criteriaSKnowingNotPoCoT,
                ],
            });
        }

        if (calibration) {
            orDefinitionCriteria({
                [Op.and]: [
                    criteriaNotPoC,
                    { [Op.not]: criteriaTKnowingNotPoC },
                    { [Op.not]: criteriaSKnowingNotPoCoT },
                    criteriaCAKnowingNotPoCoToS,
                ],
            });
        }

        return definitionCriteria;
    }
}

module.exports = GetAllRunsUseCase;
