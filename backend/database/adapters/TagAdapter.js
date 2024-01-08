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
 * TagAdapter
 */
class TagAdapter {
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
     * @param {SequelizeTag} databaseObject Object to convert.
     * @returns {Tag} Converted entity object.
     */
    toEntity({ id, text, description, email, mattermost, last_edited_name, archived, archivedAt, updatedAt }) {
        return {
            id,
            text,
            description,
            lastEditedName: last_edited_name,
            email,
            mattermost,
            archived,
            archivedAt: archivedAt ? new Date(archivedAt).getTime() : null,
            updatedAt: new Date(updatedAt).getTime(),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Tag>} entityObject Object to convert.
     * @returns {Partial<SequelizeTag>} Converted database object.
     */
    toDatabase(entityObject) {
        return entityObject;
    }
}

module.exports = TagAdapter;
