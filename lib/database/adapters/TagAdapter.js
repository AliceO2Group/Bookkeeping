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
     * @param {Object} databaseObject Object to convert.
     * @returns {Object} Converted entity object.
     */
    static toEntity({ id, text, email, mattermost }) {
        return { id, text, email, mattermost };
    }

    /**
     * Filters database record to provide necesssary information for Notification service
     * @param {Object} databaseObject Object to filter
     *  @returns {Object} Filtered object
     */
    static toNotification({ id, text, created_at, updated_at, email, mattermost }) {
        return { email, mattermost };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Object} entityObject Object to convert.
     * @returns {Object} Converted database object.
     */
    static toDatabase(entityObject) {
        return entityObject;
    }
}

module.exports = TagAdapter;
