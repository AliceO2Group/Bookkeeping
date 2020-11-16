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

const AttachmentAdapter = require('./AttachmentAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
const TagAdapter = require('./TagAdapter');
const UserAdapter = require('./UserAdapter');

/**
 * LogAdapter
 */
class LogAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity(databaseObject) {
        const {
            id,
            title,
            text,
            user,
            createdAt,
            origin,
            subtype,
            rootLogId,
            parentLogId,
            replies,
            tags,
            runs,
            subsystems,
            attachments,
        } = databaseObject;

        const entityObject = {
            id: id,
            title: title,
            text: text,
            author: UserAdapter.toEntity(user),
            createdAt: createdAt,
            origin: origin,
            subtype: subtype,
            rootLogId: rootLogId || id,
            parentLogId: parentLogId || id,
        };

        if (replies) {
            entityObject.replies = replies;
        }

        if (tags) {
            entityObject.tags = tags.map(TagAdapter.toEntity);
        } else {
            entityObject.tags = [];
        }

        if (runs) {
            entityObject.runs = runs.map(({ id, runNumber }) => ({ id, runNumber }));
        } else {
            entityObject.runs = [];
        }

        if (subsystems) {
            entityObject.subsystems = subsystems.map(SubsystemAdapter.toEntity);
        } else {
            entityObject.subsystems = [];
        }

        if (attachments) {
            entityObject.attachments = attachments.map(AttachmentAdapter.toEntity);
        } else {
            entityObject.attachments = [];
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
        const databaseObject = {
            id: entityObject.id,
            userId: entityObject.userId,
            title: entityObject.title,
            text: entityObject.text,
            tags: entityObject.tags,
            subtype: 'run',
            origin: 'process',
        };

        if (entityObject.rootLogId) {
            databaseObject.rootLogId = entityObject.rootLogId;
        }

        if (entityObject.parentLogId) {
            databaseObject.parentLogId = entityObject.parentLogId;
        }

        return databaseObject;
    }
}

module.exports = LogAdapter;
