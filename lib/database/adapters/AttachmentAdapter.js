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
    static toEntity({ id, fileName, size, mimeType, originalName, path, encoding, logId, createdAt, updatedAt }) {
        const entityObject = Object.assign(new Attachment(), {
            id: id,
            fileName: fileName,
            size: size,
            mimeType: mimeType,
            originalName: originalName,
            path: path,
            encoding: encoding,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        });

        if (logId) {
            entityObject.logId = LogAdapter.toEntity(logId).id;
        } else {
            entityObject.logId = undefined;
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
            id: entityObject.id,
            size: entityObject.size,
            path: entityObject.path,
            fileName: entityObject.filename,
            originalName: entityObject.originalname,
            mimeType: entityObject.mimetype,
            encoding: entityObject.encoding,
            logId: entityObject.logId,
        };
    }
}

module.exports = AttachmentAdapter;
