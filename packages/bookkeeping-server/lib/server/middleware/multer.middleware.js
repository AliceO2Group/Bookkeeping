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

const multer = require('multer');

const attachmentStorage = multer.diskStorage({
    destination: (_request, _file, callback) => {
        const path = process.env?.ATTACHMENT_PATH || '/var/storage';
        callback(null, path);
    },

    filename: (_request, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
    },
});

const attachmentMiddleware = multer({
    storage: attachmentStorage,
    // Necessary to handle utf-8 files naming, see https://github.com/expressjs/multer/pull/1102
    fileFilter: (_request, file, callback) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        callback(null, true);
    },
}).any('attachments');

module.exports = {
    attachmentMiddleware,
};
