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

const TagAdapter = require('./TagAdapter');
const SubsystemAdapter = require('./SubsystemAdapter');
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
            tags,
            runs,
            subsystems,
            replies,
        } = databaseObject;

        const entityObject = {
            id: id,
            title: title,
            text: text,
            author: UserAdapter.toEntity(user),
            createdAt: new Date(createdAt).getTime(),
            origin: origin,
            subtype: subtype,
            rootLogId: rootLogId || id,
            parentLogId: parentLogId || id,
        };

        if (tags) {
            entityObject.tags = tags.map(TagAdapter.toEntity);
        } else {
            entityObject.tags = [];
        }

        if (runs) {
            entityObject.runs = runs.map(({ runNumber }) => runNumber);
        } else {
            entityObject.runs = [];
        }

        if (subsystems) {
            entityObject.subsystems = subsystems.map(SubsystemAdapter.toEntity);
        } else {
            entityObject.subsystems = [];
        }

        if (replies) {
            entityObject.replies = replies;
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
            subtype: 'run',
            origin: 'process',
            userId: entityObject.userId,
            id: entityObject.id,
            title: entityObject.title,
            text: entityObject.text,
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
