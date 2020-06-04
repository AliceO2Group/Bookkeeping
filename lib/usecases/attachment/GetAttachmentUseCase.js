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
 * GetAttachment
 */
class GetAttachment {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateLogDto containing all data.
     * @returns {Promise}  Promise object represents the result of this use case.
     */
    execute(dto) {
        const queryBuilder = new QueryBuilder();
        const { params, query = {} } = dto;
        const { id } = params;
        const { mimetype } = query;

        queryBuilder.where('id').is(id);

        if (query) {
            if (mimetype) {
                if (mimetype.includes('/')) {
                    queryBuilder.where('mime_type').is(mimetype);
                } else {
                    queryBuilder.where('mime_type').startsWith(mimetype);
                }
            }
        }

        return TransactionHelper.provide(() => AttachmentRepository.findOne(queryBuilder));
    }
}

module.exports = GetAttachment;
