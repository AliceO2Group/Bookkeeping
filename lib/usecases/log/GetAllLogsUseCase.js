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
    models: {
        Log,
    },
    repositories: {
        LogRepository,
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetAllLogsUseCase
 */
class GetAllLogsUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The GetAllLogs DTO which contains all request data.
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute(dto = {}) {
        const queryBuilder = new QueryBuilder();
        const { query = {} } = dto;
        const { filter, page = {}, sort = { id: 'desc' } } = query;

        if (filter) {
            const { origin, parentLog, rootLog, tag } = filter;
            if (origin) {
                queryBuilder.where('origin').is(origin);
            }

            if (parentLog) {
                queryBuilder.where('parentLogId').is(parentLog);
            }

            if (rootLog) {
                queryBuilder.where('rootLogId').is(rootLog);
            }

            if (tag) {
                switch (tag.operation) {
                    case 'and':
                        queryBuilder
                            .setModel(Log)
                            .whereAssociation('tags', 'id').allOf(...tag.values);
                        break;
                    case 'or':
                        queryBuilder
                            .setModel(Log)
                            .whereAssociation('tags', 'id').oneOf(...tag.values);
                        break;
                }
            }
        }

        const { limit = 100, offset = 0 } = page;
        queryBuilder.limit(limit);
        queryBuilder.offset(offset);

        Object.keys(sort).forEach((s) => queryBuilder.orderBy(s, sort[s]));

        queryBuilder.include('tags');

        return TransactionHelper.provide(() => LogRepository.findAndCountAll(queryBuilder));
    }
}

module.exports = GetAllLogsUseCase;
