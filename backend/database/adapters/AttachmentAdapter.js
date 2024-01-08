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

/**
 * AttachmentAdapter
 */
class AttachmentAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
        this.toDatabase = this.toDatabase.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeAttachment} databaseObject Object to convert.
     * @returns {Attachment} Converted entity object.
     */
    toEntity(databaseObject) {
        const {
            id,
            fileName,
            size,
            mimeType,
            originalName,
            path,
            encoding,
            logId,
            createdAt,
            updatedAt,
        } = databaseObject;

        return {
            id,
            fileName,
            size,
            mimeType,
            originalName,
            path,
            encoding,
            logId,
            createdAt: new Date(createdAt).getTime(),
            updatedAt: new Date(updatedAt).getTime(),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Attachment>} entityObject Object to convert.
     * @returns {Partial<SequelizeAttachment>} Converted database object.
     */
    toDatabase(entityObject) {
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
