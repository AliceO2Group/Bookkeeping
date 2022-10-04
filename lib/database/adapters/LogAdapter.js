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
const RunAdapter = require('./RunAdapter.js');

/**
 * LogAdapter
 */
class LogAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeLog} databaseObject Object to convert.
     * @returns {Log} Converted entity object.
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
            tags: sequelizTags,
            runs,
            subsystems: sequelizeSubsytems,
            attachments: sequelizeAttachments,
        } = databaseObject;

        const minifiedRuns = (runs || []).map(RunAdapter.toMinifiedEntity);
        const tags = (sequelizTags || []).map(TagAdapter.toEntity);
        const subsystems = (sequelizeSubsytems || []).map(SubsystemAdapter.toEntity);
        const attachments = (sequelizeAttachments || []).map(AttachmentAdapter.toEntity);

        const entityObject = {
            id,
            title,
            text,
            author: UserAdapter.toEntity(user),
            createdAt: new Date(createdAt).getTime(),
            origin,
            subtype,
            rootLogId: rootLogId || id,
            parentLogId: parentLogId || id,
            runs: minifiedRuns,
            tags,
            subsystems,
            attachments,
        };

        if (replies) {
            entityObject.replies = replies;
        }

        return entityObject;
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Log>} entityObject Object to convert.
     * @returns {Partial<SequelizeLog>} Converted database object.
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
