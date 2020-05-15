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

const { Attachment } = require('../../domain/entities');
const LogAdapter = require('./TagAdapter');

/**
 * AttachmentAdapter
 */
class AttachmentAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity({ fileName, size, mimeType, originalName, path, encoding, log, createdAt, updatedAt }) {
        const entityObject = Object.assign(new Attachment(), {
            fileName: fileName,
            size: size,
            mimeType: mimeType,
            originalName: originalName,
            path: path,
            encoding: encoding,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        });

        if (log) {
            entityObject.log = LogAdapter.toEntity(log);
        } else {
            entityObject.log = undefined;
        }

        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        return {
            size: entityObject.size,
            path: entityObject.path,
            fileName: entityObject.filename,
            originalName: entityObject.originalname,
            mimeType: entityObject.mimetype,
            encoding: entityObject.encoding,
            logId: entityObject.log,
        };
    }
}

module.exports = AttachmentAdapter;
