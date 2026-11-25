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

const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getAttachment } = require('./getAttachment.js');

/**
 * Find an attachment model by its id and reject with a NotFoundError if none is found
 *
 * @param {number} id the id of the attachment to find
 * @return {Promise<SequelizeAttachment>} resolve with the attachment model found or reject with a NotFoundError
 */
exports.getAttachmentOrFail = async (id) => {
    const attachmentModel = await getAttachment(id);
    if (attachmentModel === null) {
        throw new NotFoundError(`Attachment with this id (${id}) could not be found`);
    }
    return attachmentModel;
};
