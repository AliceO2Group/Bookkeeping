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

        if (filter) {
            const { runNumber, environmentId, runQuality, o2start, o2end, nDetectors, nFlps, ddflp, dcs, epn, epnTopology, detectors } = filter;

            if (runNumber) {
                queryBuilder.where('runNumber').oneOf(runNumber);
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
            if (environmentId) {
                queryBuilder.where('environmentId').substring(environmentId);
            }
            if (runQuality) {
                queryBuilder.where('runQuality').substring(runQuality);
            }
            if (nDetectors) {
                queryBuilder.where('nDetectors').oneOf(nDetectors);
            }
            if (nFlps) {
                queryBuilder.where('nFlps').oneOf(nFlps);
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
            if (epn) {
                queryBuilder.where('epn').is(epn);
            }
            if (epnTopology) {
                queryBuilder.where('epnTopology').substring(epnTopology);
            }
            if (detectors) {
                queryBuilder.where('detectors').substring(detectors);
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
        } = await await TransactionHelper.provide(async () => {
            if (filter && filter.tag) {
                const tagQueryBuilder = new QueryBuilder();
                tagQueryBuilder.where('tagId').oneOf(...filter.tag.values).orderBy('runId', 'asc');

                let runTags;
                switch (filter.tag.operation) {
                    case 'and':
                        runTags = await RunTagsRepository
                            .findAllAndGroup(tagQueryBuilder);
                        runTags = runTags
                            .filter((runTags) => filter.tag.values.every((tagId) => runTags.tagIds.includes(tagId)));
                        break;
                    case 'or':
                        runTags = await RunTagsRepository
                            .findAll(tagQueryBuilder);
                        break;
                }

                const runIds = runTags.map((runTags) => runTags.runId);
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
