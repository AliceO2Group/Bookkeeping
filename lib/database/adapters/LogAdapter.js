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
            tags,
            createdAt,
            origin,
            subtype,
            text,
            rootLogId,
            parentLogId,
        } = databaseObject;

        const entityObject = {
            id: id,
            authorId: 'John Doe',
            title: title,
            text: text,
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
            userId: 1,
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
