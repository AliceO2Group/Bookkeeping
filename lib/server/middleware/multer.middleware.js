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
    destination: (request, file, callback) => {
        const path = process.env?.ATTACHMENT_PATH || '/var/storage';
        callback(null, path);
    },

    filename: (request, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
    },
});

const attachmentMiddleware = multer({ storage: attachmentStorage }).any('attachments');

module.exports = {
    attachmentMiddleware,
};
