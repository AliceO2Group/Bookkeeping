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
        AttachmentRepository,
        LogRepository,
        LogTagsRepository,
    },
    utilities: {
        TransactionHelper,
    },
} = require('../../database');

const {
    adapters: {
        LogAdapter,
    },
} = require('../../domain');

const GetLogUseCase = require('./GetLogUseCase');
const LogRunNumberRepository = require('../../database/repositories/LogRunNumberRepository');
const GetRunByRunNumberUseCase = require('../run/GetRunByRunNumberUseCase');

const { Notification, HttpConfig } = require('../../config');
const { NotificationService } = require('@aliceo2/web-ui');
const { getAllTagsByTextOrFail } = require('../tag/getAllTagsByTextOrFail.js');

/**
 * @type {NotificationService|null}
 */
const notification = Notification.brokers ? new NotificationService(Notification) : null;

/**
 * CreateLogUseCase
 */
class CreateLogUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateLogDto containing all data.
     * @param {Object} transaction if it applies, the transaction in which the method is executed
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto, transaction) {
        const { body, files } = dto;
        const { parentLogId, tags: tagsTexts, runNumbers: serializedRunNumbers } = body;

        let tags = [];
        const { log, error } = await TransactionHelper.provide(
            async () => {
                body.userId = dto?.session?.id || null;

                try {
                    body.rootLogId = await this._getRootLogId(parentLogId);
                    tags = await getAllTagsByTextOrFail(tagsTexts);

                    // Parse comma-separated string to array of numbers
                    const runNumbers = serializedRunNumbers ? [
                        ...new Set(serializedRunNumbers.split(',')
                            .map((x) => x.trim())
                            .map((x) => parseInt(x, 10))),
                    ] : null;

                    body.runIds = await this._getRunIdsFromRunNumbers(runNumbers);
                } catch (e) {
                    return {
                        error: {
                            status: '400',
                            title: e.message,
                        },
                    };
                }

                return { log: await LogRepository.insert(LogAdapter.toDatabase(body)) };
            },
            { transaction },
        );

        if (error) {
            return { error };
        }

        if (!error && tags.length > 0) {
            await TransactionHelper.provide(
                () => LogTagsRepository.bulkInsert(tags.map((tag) => ({ logId: log.id, tagId: tag.id }))),
                { transaction },
            );
        }

        if (!error && files && files.length > 0) {
            await TransactionHelper.provide(
                () => AttachmentRepository.bulkInsert(files.map((file) => ({ ...file, logId: log.id }))),
                { transaction },
            );
        }

        if (!error && body.runIds && body.runIds.length > 0) {
            await TransactionHelper.provide(
                () => LogRunNumberRepository.bulkInsert(body.runIds.map((runId) => ({ runId, logId: log.id }))),
                { transaction },
            );
        }

        const result = await new GetLogUseCase().execute({ params: { logId: log.id } });

        if (result) {
            await this._notifyCreation(result);
        }

        return { result };
    }

    /**
     * Returns the root log ID, optionally corresponding to a parent log id
     *
     * @param {number} [parentLogId] optionally the id of the parent log
     * @return {Promise<null|number>} the root log id
     * @private
     */
    async _getRootLogId(parentLogId) {
        if (!parentLogId) {
            return null;
        }

        const parentLog = await new GetLogUseCase().execute({ params: { logId: parentLogId } });

        if (!parentLog) {
            throw new Error(`Parent log with this id (${parentLogId}) could not be found`);
        }

        return parentLog.rootLogId || parentLog.id;
    }

    /**
     * Returns the list of run ids extracted from a comma separated (CSV) list of run numbers
     *
     * @param {number[]} [runNumbers] the CSV list of run numbers
     * @return {Promise<null|number[]>} the list of run ids
     * @private
     */
    async _getRunIdsFromRunNumbers(runNumbers) {
        if (!runNumbers) {
            return null;
        }

        // Error out if any value is NaN
        if (runNumbers.some(Number.isNaN)) {
            throw new Error('Run numbers should be comma-separated, and should only contain numbers');
        }

        /**
         * Check if, for each runNumber, there is a run present in the DB with that runNumber
         * Add the run's id to runIds if there is.
         */
        const runIds = [];
        for (const runNumber of runNumbers) {
            const run = await new GetRunByRunNumberUseCase()
                .execute({ params: { runNumber } });

            if (!run) {
                throw new Error(`Run with run number '${runNumber}' could not be found`);
            }

            runIds.push(run.id);
        }

        return runIds;
    }

    /**
     * Send a notification through notification service (if it applies) about the created log
     *
     * @param {object} log the created log
     * @return {Promise<void>} notification sent
     * @private
     */
    async _notifyCreation({ id, tags, runs, title, author, text }) {
        if (notification?.isConfigured()) {
            const url = `${HttpConfig.origin}?page=log-detail&id=${id}`;
            notification.send(
                tags.map((tag) => tag.text),
                title,
                author.name,
                url,
                runs.map((run) => run.runNumber),
                text,
            );
        }
    }
}

module.exports = CreateLogUseCase;
