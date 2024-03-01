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

const { createLog } = require('./createLog.js');
const { getLog } = require('./getLog.js');
const { logAdapter, attachmentAdapter } = require('../../../database/adapters/index.js');
const { repositories: { LogRepository, LogLhcFillsRepository } } = require('../../../database');
const { dataSource } = require('../../../database/DataSource.js');
const { LogEnvironmentsRepository } = require('../../../database/repositories/index.js');

/**
 * @typedef LogRelationsToInclude object specifying which log's relations should be fetched alongside the log
 * @property {boolean} [tags] if true, related tags will be fetched alongside the log
 */

/**
 * Global service to handle log instances
 */
class LogService {
    /**
     * Find and return a log by its id
     *
     * @param {number} logId the id of the log to find
     * @return {Promise<Log|null>} resolve with the log found or null
     */
    async get(logId) {
        const log = await getLog(logId, (queryBuilder) => {
            queryBuilder
                .include('user')
                .include('tags')
                .include('runs')
                .include('lhcFills')
                .include('subsystems')
                .include('environments')
                .include('attachments');
        });
        return log ? logAdapter.toEntity(log) : null;
    }

    /**
     * Retrieves a paginated list of all root logs along with the total count.
     * @param {number} limit The maximum number of root logs to retrieve in a single call.
     * @param {number} offset The number of root logs to skip before starting to return results.
     * @return {Promise<{count: number, logs: Log[]}>} A promise that resolves with an object containing the total count of all root logs,
     * and an array of the root logs for the current page, or null if no logs are found.
     */
    async getAllRootLogs(limit, offset) {
        const { count, logIds } = await this._getRootLogIds(limit, offset);
        const logs = await this._getAllByIds(logIds);

        return {
            count,
            logs,
        };
    }

    /**
     * Fetches the IDs of all root logs within specified pagination limits and the total count of all root logs.
     * @param {number} limit The maximum number of log IDs to return in a single call.
     * @param {number} offset The number of log IDs to skip before starting to return results.
     * @return {Promise<{logIds: unknown[], count: number}>} A promise that resolves with an object containing an array of root log IDs
     * for the current page and the total count of all root logs, or null if no logs are found.
     */
    async _getRootLogIds(limit, offset) {
        const { rows, count } = await LogRepository.findAndCountAll({
            where: { parentLogId: null },
            limit,
            offset,
            attributes: ['id'],
            raw: true,
        });

        const logIds = rows.map((row) => row.id);

        return { count, logIds };
    }

    /**
     * Retrieves a list of replies to a log based off the given logId
     * @param {number} logId The id of the log of which the child logs are retrieved
     * @return {Promise<Log[]>} A promise that resolves with the replies logs
     */
    async getChildLogsByParentId(logId) {
        const childLogQueryBuilder = this._createFindQueryBuilder()
            .where('parentLogId').is(logId);

        const childLogs = await LogRepository.findAll(childLogQueryBuilder);
        return this._prepareLogsEntities(childLogs);
    }

    /**
     * Returns all the logs related to a given LHC fill
     *
     * @param {number} lhcFillNumber the fill number of the LHC fill for which logs must be returned
     * @return {Promise<Log[]>} the resulting logs
     */
    async getAllByLhcFill(lhcFillNumber) {
        const logLhcFillQueryBuilder = dataSource.createQueryBuilder()
            .include({
                association: 'lhcFill',
                where: { fillNumber: lhcFillNumber },
            });

        const logLhcFills = await LogLhcFillsRepository.findAll(logLhcFillQueryBuilder);

        const logIds = logLhcFills.map((logLhcFill) => logLhcFill.logId);
        return this._getAllByIds(logIds);
    }

    /**
     * Returns all the logs related to a given LHC fill
     *
     * @param {string} environmentId the id of the environment for which logs must be returned
     * @return {Promise<Log[]>} the resulting logs
     */
    async getAllByEnvironment(environmentId) {
        const logEnvironmentQueryBuilder = dataSource.createQueryBuilder()
            .include({
                association: 'environment',
                where: { id: environmentId },
            });

        const logEnvironments = await LogEnvironmentsRepository.findAll(logEnvironmentQueryBuilder);

        const logIds = logEnvironments.map((logEnvironment) => logEnvironment.logId);
        return this._getAllByIds(logIds);
    }

    /**
     * Return all the logs that correspond to a given list of ids with a default list of shallow relations
     * and also adds the number of replies to each log.
     *
     * @param {number[]} logIds the list of ids of logs to fetch
     * @return {Promise<Log[]>} the resulting logs
     */
    async _getAllByIds(logIds) {
        const logQueryBuilder = this._createFindQueryBuilder();

        logQueryBuilder.where('id').oneOf(...logIds);
        const logs = await LogRepository.findAll(logQueryBuilder);
        return this._prepareLogsEntities(logs);
    }

    /**
     * Return all the logs after preparing them to entities and adding childrenCount
     *
     * @param {SequelizeLog[]} logs the list of logs to prepare
     * @return {Promise<Log[]>} the resulting prepared logs
     */
    _prepareLogsEntities(logs) {
        const logEntities = logs.map(logAdapter.toEntity);
        return LogRepository.addChildrenCountByLog(logEntities);
    }

    /**
     * Return a standard log QueryBuilder
     *
     * @return {QueryBuilder} the resulting QueryBuilder
     */
    _createFindQueryBuilder() {
        return dataSource.createQueryBuilder()
            .include({ association: 'runs', attributes: ['id', 'runNumber'] })
            .include({ association: 'lhcFills', attributes: ['fillNumber'] })
            .include({ association: 'environments', attributes: ['id'] });
    }

    /**
     * Create a log in the database and return the created instance
     *
     * @param {Partial<Log>} newLog the log to create
     * @param {number[]} runNumbers the list of run numbers representing runs to which log is related
     * @param {string[]} tagsTexts the texts of tags to attach to log
     * @param {string[]} environments the environmentIds to attach to log
     * @param {number[]} lhcFills the LHC fill numbers associated with this log
     * @param {Attachment[]} attachments the list of attachments to link to the log
     * @return {Promise<Log>} resolve with the created log instance
     */
    async create(newLog, runNumbers = [], tagsTexts = [], environments = [], lhcFills = [], attachments = []) {
        const logId = await createLog(
            logAdapter.toDatabase(newLog),
            runNumbers,
            tagsTexts,
            environments,
            lhcFills,
            attachments.map((attachment) => attachmentAdapter.toDatabase(attachment)),
        );
        // No transaction, log is ready here and can not be null
        return this.get(logId);
    }
}

exports.LogService = LogService;

exports.logService = new LogService();
