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
const { getTagsByTextsUseCase } = require('../tag/getTagsByTextsUseCase.js');

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
                environmentIds,
                runQualities,
                fillNumbers,
                o2start,
                o2end,
                runDuration,
                nDetectors,
                nFlps,
                ddflp,
                dcs,
                epn,
                epnTopology,
                detectors,
                lhcPeriod,
            } = filter;

            if (runNumbers) {
                const runNumberList = runNumbers.split(SEARCH_ITEMS_SEPARATOR).filter((runNumber) => parseInt(runNumber, 10));
                queryBuilder.where('runNumber').oneOf(...runNumberList);
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
            if (epnTopology) {
                queryBuilder.where('epnTopology').substring(epnTopology);
            }
            if (detectors) {
                queryBuilder.where('detectors').substring(detectors);
            }
            if (lhcPeriod) {
                queryBuilder.where('lhcPeriod').substring(lhcPeriod);
            }
        }

        const { limit = 100, offset = 0 } = page;
        queryBuilder.include('tags');
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        const {
            count,
            rows,
        } = await TransactionHelper.provide(async () => {
            if (filter && filter.tags && filter.tags.values.length > 0) {
                const tags = await getTagsByTextsUseCase(filter.tags.values);
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
        return {
            count,
            runs: rows.map(RunAdapter.toEntity),
        };
    }
}

module.exports = GetAllRunsUseCase;
