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

const GetAllLogsUseCase = require('./GetAllLogsUseCase');
const GetLogUseCase = require('./GetLogUseCase');
const {
    log: {
        toTreeView,
    },
} = require('../../presentation');

/**
 * GetLogTreeUseCase
 */
class GetLogTreeUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetLogDto containing all data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto) {
        const { params } = dto;
        const { logId } = params;

        const log = await new GetLogUseCase().execute({ params: { logId } });

        if (log === null) {
            return null;
        }

        let rootLog;
        if (log.id === log.rootLogId) {
            rootLog = log;
        } else {
            rootLog = await new GetLogUseCase().execute({ params: { logId: log.rootLogId } });
        }

        const logs = await new GetAllLogsUseCase().execute({ query: { filter: { rootLog: rootLog.id }, sort: { id: 'asc' } } });

        return toTreeView(rootLog, logs.logs);
    }
}

module.exports = GetLogTreeUseCase;
