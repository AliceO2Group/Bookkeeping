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
const { NotificationService, Log } = require('@aliceo2/web-ui');
const { getLog } = require('./getLog.js');
const { getAllTagsByTextOrFail } = require('../tag/getAllTagsByTextOrFail.js');
const { getAllEnvironmentsOrFail } = require('../environment/getAllEnvironmentsOrFail.js');
const { getRunIdsFromRunNumbersOrFail } = require('../run/getRunIdsFromRunNumbersOrFail.js');
const LogRepository = require('../../../database/repositories/LogRepository.js');
const LogTagsRepository = require('../../../database/repositories/LogTagsRepository.js');
const AttachmentRepository = require('../../../database/repositories/AttachmentRepository.js');
const LogRunsRepository = require('../../../database/repositories/LogRunsRepository.js');
const LogLhcFillsRepository = require('../../../database/repositories/LogLhcFillsRepository.js');
const { getLogOrFail } = require('./getLogOrFail.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');
const { checkLhcFillsExistOrFail } = require('../lhcFill/checkLhcFillsExistOrFail');
const { LogEnvironmentsRepository } = require('../../../database/repositories');

const logger = new Log('log-creation');

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
        const runNumbers = runs.map(({ runNumber }) => runNumber);

        const message = {
            id,
            parentLogId,
            title,
            tag: tags.map((tag) => tag.text).join(','),
            author: user?.name ?? 'Anonymous',
            url: `${HttpConfig.origin}?page=log-detail&id=${id}`,
            runNumbers: runNumbers.length > 0 ? runNumbers.join(',') : undefined,
            extra: text,
        };

        await notification.send(message).catch((e) => {
            logger.errorMessage(`An error occurred when trying to send notification to Kafka ${e.stack}`, {});
        });
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

    try {
        const parentLog = await getLogOrFail(parentLogId);
        return parentLog.rootLogId || parentLog.id;
    } catch (e) {
        throw new NotFoundError(`Parent log with this id (${parentLogId}) could not be found`);
    }
};

/**
 * Create a log in the database and return the auto generated id
 *
 * @param {Partial<SequelizeLog>} log the log to create
 * @param {number[]} runNumbers the list of run numbers representing runs to which log is related
 * @param {string[]} tagsTexts the texts of tags to attach to log
 * @param {string[]} environmentIds the environmentIds to attach to log
 * @param {number[]} lhcFills the LHC fill numbers associated with this log
 * @param {SequelizeAttachment[]} attachments the list of attachments to link to the log
 * @param {Object} [transaction] optionally the transaction in which one the log creation is executed
 * @return {Promise<number>} resolve once the creation is done providing the id of the log that have been (or will be) created
 */
exports.createLog = async (log, runNumbers, tagsTexts, environmentIds, lhcFills, attachments, transaction) => {
    const runIds = await getRunIdsFromRunNumbersOrFail(runNumbers);
    const tags = await getAllTagsByTextOrFail(tagsTexts);
    const environments = await getAllEnvironmentsOrFail(environmentIds);
    if (lhcFills) {
        await checkLhcFillsExistOrFail(lhcFills);
    }

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

    if (lhcFills.length > 0) {
        await TransactionHelper.provide(
            () => LogLhcFillsRepository.bulkInsert(lhcFills.map((lhcFill) => ({ logId: newLogId, fillNumber: lhcFill }))),
            { transaction },
        );
    }

    if (environments.length > 0) {
        await TransactionHelper.provide(
            () => LogEnvironmentsRepository.bulkInsert(environments.map((environment) => ({ environmentId: environment.id, logId: newLogId }))),
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
                .include('runs')
                .include('environments')
                .include('lhcFills');
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
