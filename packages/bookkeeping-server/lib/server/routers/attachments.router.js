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

const { AttachmentsController } = require('../controllers');
const { multerMiddleware: { attachmentMiddleware } } = require('../middleware');

module.exports = {
    method: 'post',
    path: 'attachments',
    controller: [attachmentMiddleware, AttachmentsController.createAttachment],
    args: { public: false },
    children: [
        {
            method: 'get',
            path: ':attachmentId',
            controller: AttachmentsController.readAttachment,
            args: { public: false },
        },
    ],
};
