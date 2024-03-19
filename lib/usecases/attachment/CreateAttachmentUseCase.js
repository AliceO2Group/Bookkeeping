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

const { AttachmentRepository } = require('../../database/repositories');
const {
    utilities: {
        TransactionHelper,
    },
} = require('../../database');
const { attachmentAdapter } = require('../../database/adapters/index.js');

/**
 * CreateAttachmentUseCase
 */
class CreateAttachmentUseCase {
    /**
     * Executes this use case.
     *
     * @param {Object} dto The CreateLogDto containing all data.
     * @returns {Promise}  Promise object represents the result of this use case.
     */
    execute(dto) {
        const { files, body } = dto;
        return TransactionHelper.provide(() => AttachmentRepository.insert({ ...attachmentAdapter.toDatabase(files[0]), logId: body.log }));
    }
}

module.exports = CreateAttachmentUseCase;
