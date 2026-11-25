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

const { attachmentAdapter } = require('../../../database/adapters/index.js');
const { dataSource } = require('../../../database/DataSource.js');
const { createAttachment } = require('./createAttachment.js');
const { getAttachmentOrFail } = require('./getAttachmentOrFail.js');

/**
 * Global service to handle attachments
 */
class AttachmentService {
    /**
     * Return the attachment matching the given id, or reject if there is none
     *
     * @param {number} id the id of the attachment to find
     * @return {Promise<Attachment>} resolves with the attachment found or rejects with a NotFoundError
     */
    async getOneOrFail(id) {
        return attachmentAdapter.toEntity(await getAttachmentOrFail(id));
    }

    /**
     * Store a file as an attachment, optionally linked to a log
     *
     * @param {Object} file the file as provided by the upload middleware (multer)
     * @param {number} [logId] the id of the log to link the attachment to
     * @return {Promise<Attachment>} resolves with the created attachment
     */
    async create(file, logId) {
        return dataSource.transaction(async () => {
            const attachmentId = await createAttachment({ ...attachmentAdapter.toDatabase(file), logId });
            return attachmentAdapter.toEntity(await getAttachmentOrFail(attachmentId));
        });
    }
}

exports.AttachmentService = AttachmentService;

exports.attachmentService = new AttachmentService();
