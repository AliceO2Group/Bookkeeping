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

const { utilities: { TransactionHelper } } = require('../../../database');
const { Notification, HttpConfig } = require('../../../config');
const { NotificationService } = require('@aliceo2/web-ui');
const { getLog } = require('./getLog.js');
const { getAllTagsByTextOrFail } = require('../tag/getAllTagsByTextOrFail.js');
const { getRunIdsFromRunNumbersOrFail } = require('../run/getRunIdsFromRunNumbersOrFail.js');
const LogRepository = require('../../../database/repositories/LogRepository.js');
const LogTagsRepository = require('../../../database/repositories/LogTagsRepository.js');
const AttachmentRepository = require('../../../database/repositories/AttachmentRepository.js');
const LogRunsRepository = require('../../../database/repositories/LogRunsRepository.js');

/**
 * @type {NotificationService|null}
 */
const notification = Notification.brokers ? new NotificationService(Notification) : null;

/**
 * Send a notification through notification service (if it applies) about the created log
 *
 * @param {SequelizeLog|null} log the log to notify
 * @return {Promise<void>} notification sent
 * @private
 */
const notifyCreation = async (log) => {
    const { id, parentLogId, tags, runs, title, user, text } = log;

    if (notification?.isConfigured() && tags.length > 0 && title) {
        const tagsAsString = tags.map((tag) => tag.text).join(',');
        const runNumbers = runs.map(({ runNumber }) => runNumber);
        const url = `${HttpConfig.origin}?page=log-detail&id=${id}`;

        const message = {
            id,
            parentLogId,
            title,
            tag: tagsAsString,
            author: user?.name ?? 'Anonymous',
            url,
            runNumbers: runNumbers.length > 0 ? runNumbers.join(',') : undefined,
            extra: text,
        };

        notification.send(message);
    }
};

/**
 * Returns the root log ID, optionally corresponding to a parent log id
 *
 * @param {number} [parentLogId] optionally the id of the parent log
 * @return {Promise<number|null>} the root log id
 * @private
 */
const getRootLogId = async (parentLogId) => {
    if (!parentLogId) {
        return null;
    }

    const parentLog = await getLog(parentLogId);

    if (!parentLog) {
        throw new Error(`Parent log with this id (${parentLogId}) could not be found`);
    }

    return parentLog.rootLogId || parentLog.id;
};

/**
 * Create a log in the database and return the auto generated id
 *
 * @param {Partial<SequelizeLog>} log the log to create
 * @param {number[]} runNumbers the list of run numbers representing runs to which log is related
 * @param {string[]} tagsTexts the texts of tags to attach to log
 * @param {SequelizeAttachment[]} attachments the list of attachments to link to the log
 * @param {Object} [transaction] optionally the transaction in which one the log creation is executed
 * @return {Promise<number>} resolve once the creation is done providing the id of the log that have been (or will be) created
 */
exports.createLog = async (log, runNumbers, tagsTexts, attachments, transaction) => {
    const runIds = await getRunIdsFromRunNumbersOrFail(runNumbers);
    const tags = await getAllTagsByTextOrFail(tagsTexts);

    const { id: newLogId } = await TransactionHelper.provide(
        async () => {
            log.rootLogId = await getRootLogId(log.parentLogId);
            return LogRepository.insert(log);
        },
        { transaction },
    );

    if (tags.length > 0) {
        await TransactionHelper.provide(
            () => LogTagsRepository.bulkInsert(tags.map((tag) => ({ logId: newLogId, tagId: tag.id }))),
            { transaction },
        );
    }

    if (attachments.length > 0) {
        await TransactionHelper.provide(
            () => AttachmentRepository.bulkInsert(attachments.map((attachment) => ({ ...attachment, logId: newLogId }))),
            { transaction },
        );
    }

    if (runIds.length > 0) {
        await TransactionHelper.provide(
            () => LogRunsRepository.bulkInsert(runIds.map((runId) => ({ runId, logId: newLogId }))),
            { transaction },
        );
    }

    /**
     * Notify the current log creation, once the log is actually inserted (i.e. when an eventual transaction has been committed)
     *
     * @return {Promise<void>} resolve once the notification has been sent
     */
    const notify = async () => {
        const createdLog = await getLog(newLogId, (queryBuilder) => {
            queryBuilder
                .include('user')
                .include('tags')
                .include('runs');
        });
        if (createdLog !== null) {
            await notifyCreation(createdLog);
        }
    };

    if (!transaction) {
        await notify();
    } else {
        transaction.afterCommit(() => notify());
    }

    return newLogId;
};
