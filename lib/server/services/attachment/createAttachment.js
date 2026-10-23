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

const { AttachmentRepository } = require('../../../database/repositories/index.js');

/**
 * Create an attachment in the database and return the auto generated id
 *
 * @param {Partial<SequelizeAttachment>} attachment the attachment to create
 * @return {Promise<number>} resolve once the creation is done providing the id of the attachment that have been (or will be) created
 */
exports.createAttachment = async (attachment) => {
    const { /** @type {number} id */ id } = await AttachmentRepository.insert(attachment);
    return id;
};
