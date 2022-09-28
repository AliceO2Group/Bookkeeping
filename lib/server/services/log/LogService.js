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
const { LogAdapter, AttachmentAdapter } = require('../../../database/adapters/index.js');

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
                .include('subsystems')
                .include('attachments');
        });
        return log ? LogAdapter.toEntity(log) : null;
    }

    /**
     * Create a log in the database and return the created instance
     *
     * @param {Partial<Log>} newLog the log to create
     * @param {number[]} runNumbers the list of run numbers representing runs to which log is related
     * @param {string[]} tagsTexts the texts of tags to attach to log
     * @param {Attachment[]} attachments the list of attachments to link to the log
     * @return {Promise<Log>} resolve with the created log instance
     */
    async create(newLog, runNumbers = [], tagsTexts = [], attachments = []) {
        const logId = await createLog(
            LogAdapter.toDatabase(newLog),
            runNumbers,
            tagsTexts,
            attachments.map((attachment) => AttachmentAdapter.toDatabase(attachment)),
        );
        // No transaction, log is ready here and can not be null
        return this.get(logId);
    }
}

exports.LogService = LogService;

exports.logService = new LogService();
