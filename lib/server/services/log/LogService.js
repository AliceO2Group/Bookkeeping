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
     * Returns all the logs related to a given LHC fill
     *
     * @param {number} lhcFillNumber the fill number of the LHC fill for which logs must be returned
     * @return {Promise<Log[]>} the resulting logs
     */
    async getAllByLhcFill(lhcFillNumber) {
        const logLhcFillQueryBuilder = dataSource.createQueryBuilder()
            .include({
                association: 'lhcFill',
                where: { fill_number: lhcFillNumber },
            });

        const logLhcFills = await LogLhcFillsRepository.findAll(logLhcFillQueryBuilder);

        const logIds = logLhcFills.map((logLhcFill) => logLhcFill.logId);

        const logQueryBuilder = dataSource.createQueryBuilder()
            .where('id').oneOf(...logIds)
            .include({ association: 'runs', attributes: ['id', 'runNumber'] })
            .include({ association: 'lhcFills', attributes: ['fillNumber'] })
            .include({ association: 'environments', attributes: ['id'] });

        return (await LogRepository.findAll(logQueryBuilder)).map(logAdapter.toEntity);
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
