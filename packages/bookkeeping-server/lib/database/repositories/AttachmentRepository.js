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
        Attachment,
    },
} = require('../');
const Repository = require('./Repository');

/**
 * Attachment repository
 */
class AttachmentRepository extends Repository {
    /**
     * Creates a new `AttachmentRepository` instance.
     */
    constructor() {
        super(Attachment);
    }

    /**
     * Bulk insert entities.
     *
     * @param {SequelizeAttachment[]|SequelizeAttachment} attachments List of attachments to insert.
     * @returns {Promise} Promise object represents the just inserted Attachments.
     */
    async bulkInsert(attachments) {
        attachments = Array.isArray(attachments) ? attachments : [attachments];

        return Attachment.bulkCreate(attachments, { returning: true });
    }
}

module.exports = new AttachmentRepository();
