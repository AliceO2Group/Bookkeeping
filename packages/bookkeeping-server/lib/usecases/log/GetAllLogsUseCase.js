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
        LogRepository,
        EnvironmentRepository,
        UserRepository,
        LogTagsRepository,
        LogRunsRepository,
        LogLhcFillsRepository,
        LogEnvironmentsRepository,
    },
} = require('../../database');
const { getTagsByText } = require('../../server/services/tag/getTagsByText.js');
const { groupByProperty } = require('../../database/utilities/groupByProperty.js');
const { logAdapter } = require('../../database/adapters/index.js');
const { ApiConfig } = require('../../config/index.js');
const { Op } = require('sequelize');
const { dataSource } = require('../../database/DataSource.js');
const { checkForFilterExclusion } = require('../common/checkForFilterExclusion.js');

/**
 * Apply the given filter on the given query builder
 *
 * @param {DataSource} dataSource data source to use to create query builders
 * @param {QueryBuilder} queryBuilder the query builder on which filters must be applied
 * @param {object} filter the filters to apply
 * @return {Promise<void>} resolves once the filter has been applied
 */
const applyFilter = async (dataSource, queryBuilder, filter) => {
    const { title, content, author, created, origin, parentLog, rootLog } = filter;

    if (title) {
        queryBuilder.where('title').substring(title);
    }

    if (content) {
        queryBuilder.literalWhere('MATCH (Log.text) AGAINST (:contentSearch IN BOOLEAN MODE)', { contentSearch: `"${content}"` });
    }

    if (author) {
        const filters = author.split(',').map((filter) => checkForFilterExclusion(filter.trim()));

        const exclusionConditions = filters
            .filter(({ excl, strippedFilter }) => excl && strippedFilter !== '')
            .map(({ strippedFilter }) => ({ name: { [Op.notLike]: `%${strippedFilter}%` } }));

        const inclusionConditions = filters
            .filter(({ excl, strippedFilter }) => !excl && strippedFilter !== '')
            .map(({ strippedFilter }) => ({ name: { [Op.like]: `%${strippedFilter}%` } }));

        const conditions = {
            [Op.and]: [
                ...exclusionConditions.length > 0 ? [{ [Op.and]: exclusionConditions }] : [],
                ...inclusionConditions.length > 0 ? [{ [Op.or]: inclusionConditions }] : [],
            ],
        };

        const userResults = await UserRepository.findAll({ where: conditions });
        const userIds = userResults.map(({ id }) => id) || [0];
        queryBuilder.where('userId').oneOf(...userIds);
    }

    if (created) {
        const from = created.from !== undefined ? created.from : 0;
        const to = created.to !== undefined ? created.to : new Date().getTime();
        queryBuilder.where('createdAt').between(from, to);
    }

    if (origin) {
        queryBuilder.where('origin').is(origin);
    }

    if (parentLog) {
        queryBuilder.where('parentLogId').is(parentLog);
    }

    if (rootLog) {
        queryBuilder.where('rootLogId').is(rootLog);
    }

    if (filter.tags?.values?.length > 0) {
        const tags = await getTagsByText(filter.tags.values);
        const logTagQueryBuilder = dataSource.createQueryBuilder()
            .where('tagId').oneOf(...tags.map(({ id }) => id)).orderBy('logId', 'asc');

        let logIds;
        switch (filter.tags.operation) {
            case 'and':
                logIds = groupByProperty(await LogTagsRepository.findAll(logTagQueryBuilder), 'logId')
                    .filter(({ values }) => tags.every((tag) => values.some((item) => item.tagId === tag.id)))
                    .map(({ index }) => index);
                break;
            case 'or':
                logIds = (await LogTagsRepository.findAll(logTagQueryBuilder)).map(({ logId }) => logId);
                break;
        }

        queryBuilder.where('id').oneOf(...logIds);
    }

    if (filter.run?.values?.length > 0) {
        const runQueryBuilder = dataSource.createQueryBuilder();
        runQueryBuilder.include({
            association: 'run',
            where: { runNumber: { [Op.in]: filter.run.values } },
        }).orderBy('logId', 'asc');

        let logRuns;
        switch (filter.run.operation) {
            case 'and':
                logRuns = await LogRunsRepository
                    .findAllAndGroup(runQueryBuilder);
                logRuns = logRuns
                    .filter((logRun) => filter.run.values.every((runNumber) => logRun.runNumbers.includes(runNumber)));
                break;
            case 'or':
                logRuns = await LogRunsRepository
                    .findAll(runQueryBuilder);
                break;
        }

        const logIds = logRuns.map((logRun) => logRun.logId);
        queryBuilder.where('id').oneOf(...logIds);
    }

    if (filter.lhcFills?.values?.length > 0) {
        const logLhcFillQueryBuilder = dataSource.createQueryBuilder();
        logLhcFillQueryBuilder.include({
            association: 'lhcFill',
            where: { fill_number: { [Op.in]: filter.lhcFills.values } },
        }).orderBy('logId', 'asc');

        let logLhcFills;
        switch (filter.lhcFills.operation) {
            case 'and':
                logLhcFills = await LogLhcFillsRepository.findAllAndGroup(logLhcFillQueryBuilder);
                logLhcFills = logLhcFills
                    .filter((logLhcFill) => filter.lhcFills.values.every((fillNumber) => logLhcFill.fillNumbers.includes(fillNumber)));
                break;
            case 'or':
                logLhcFills = await LogLhcFillsRepository.findAll(logLhcFillQueryBuilder);
                break;
        }

        const logIds = logLhcFills.map((logLhcFill) => logLhcFill.logId);

        queryBuilder.where('id').oneOf(...logIds);
    }

    if (filter.environments?.values?.length > 0) {
        const validEnvironments = await EnvironmentRepository.findAll({ where: { id: { [Op.in]: filter.environments.values } } });

        const logEnvironmentQueryBuilder = dataSource.createQueryBuilder()
            .where('environmentId')
            .oneOf(...validEnvironments.map(({ id }) => id))
            .orderBy('logId', 'asc');

        let logIds;
        switch (filter.environments.operation) {
            case 'and':
                logIds = groupByProperty(await LogEnvironmentsRepository.findAll(logEnvironmentQueryBuilder), 'logId')
                    .filter(({ values }) => validEnvironments.every((env) => values.some((item) => item.environmentId === env.id)))
                    .map(({ index }) => index);
                break;
            case 'or':
                logIds = (await LogEnvironmentsRepository.findAll(logEnvironmentQueryBuilder)).map(({ logId }) => logId);
                break;
        }

        queryBuilder.where('id').oneOf(...logIds);
    }
};

/**
 * Apply a given sorting on a given query builder
 *
 * @param {QueryBuilder} queryBuilder the query builder to apply sorting on
 * @param {object} sort the sorting configuration
 * @return {void}
 */
const applySorting = (queryBuilder, sort) => {
    const { id, title, author, createdAt, tags, runs, environments } = sort;

    if (id) {
        queryBuilder.orderBy('id', sort.id);
    }

    if (title) {
        queryBuilder.orderBy('title', sort.title);
    }

    if (author) {
        queryBuilder.orderBy('name', sort.author, 'user');
    }

    if (createdAt) {
        queryBuilder.orderBy('createdAt', sort.createdAt);
    }

    if (tags) {
        queryBuilder.orderBy('text', sort.tags, 'tags');
    }

    if (runs) {
        queryBuilder.orderBy('id', sort.runs, 'runs');
    }

    if (environments) {
        queryBuilder.orderBy('id', sort.environments, 'environments');
    }
};

/**
 * GetAllLogsUseCase
 */
class GetAllLogsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Partial<GetAllLogsDto>} dto The GetAllLogs DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = dataSource.createQueryBuilder();
        const { query = {} } = dto;
        const { filter, sort = { id: 'desc' }, page = {} } = query;

        const { count, rows } = await dataSource.transaction(async () => {
            queryBuilder.include('user')
                .include('tags')
                .include({ association: 'runs', attributes: ['id', 'runNumber'] })
                .include({ association: 'lhcFills', attributes: ['fillNumber'] })
                .include('subsystems')
                .include('attachments')
                .include({ association: 'environments', attributes: ['id'] });

            if (filter) {
                await applyFilter(dataSource, queryBuilder, filter);
            }

            if (sort) {
                applySorting(queryBuilder, sort);
            }

            const { limit = ApiConfig.pagination.limit, offset = 0 } = page;
            queryBuilder.limit(limit);
            queryBuilder.offset(offset);

            return LogRepository.findAndCountAll(queryBuilder);
        });

        const rowsWithReplies = await LogRepository.addChildrenCountByLog(rows);

        return {
            count,
            logs: rowsWithReplies.map(logAdapter.toEntity),
        };
    }
}

module.exports = GetAllLogsUseCase;
