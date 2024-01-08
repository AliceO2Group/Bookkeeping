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
    },
    utilities: {
        QueryBuilder,
        TransactionHelper,
    },
} = require('../../database');

/**
 * GetLogAttachmentUseCase
 */
class GetLogAttachmentUseCase {
    /**
     * Execute the use case.
     *
     * @param {Object} dto The GetLogAttachment DTO which contains all the request data.
     * @returns {Promise} Promise object representing the result of the use case
     */
    async execute(dto) {
        const queryBuilder = new QueryBuilder();
        const { params } = dto;
        const { attachmentId, logId } = params;
        queryBuilder
            .where('id').is(attachmentId);

        const result = await TransactionHelper.provide(() => AttachmentRepository.findOne(queryBuilder));
        if (!result) {
            return {
                error: {
                    status: '404',
                    title: `Attachment with this id (${attachmentId}) could not be found`,
                },
            };
        }
        if (result.logId !== logId) {
            return {
                error: {
                    status: '400',
                    title: `Log with this id (${logId}) does not have Attachment with this id (${attachmentId})`,
                },
            };
        }
        return { result };
    }
}

module.exports = GetLogAttachmentUseCase;
