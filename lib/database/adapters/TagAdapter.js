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
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeTag} databaseObject Object to convert.
     * @returns {Tag} Converted entity object.
     */
    static toEntity({ id, text, email, mattermost, last_edited_name, updatedAt, createdAt }) {
        return {
            id,
            text,
            lastEditedName: last_edited_name,
            email,
            mattermost,
            updatedAt: new Date(updatedAt).getTime(),
            createdAt: new Date(createdAt).getTime(),
        };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Tag>} entityObject Object to convert.
     * @returns {Partial<SequelizeTag>} Converted database object.
     */
    static toDatabase(entityObject) {
        return entityObject;
    }
}

module.exports = TagAdapter;
