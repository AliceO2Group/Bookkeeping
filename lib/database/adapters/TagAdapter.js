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

 const filterObjectFields = (obj, args) => {
    // First check is needed for `fields[TYPE]=` to still return values
    if (!args || (args.length == 1 && args[0] === '') || args.length == 0 || !args['tag']) return obj;

    return ({
        ...args['tag'].split(',').reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
    })
}


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
    static toEntity({ id, text, email, mattermost, last_edited_name, updatedAt }, fields) {
        return filterObjectFields({
            id: id,
            text: text,
            lastEditedName: last_edited_name,
            email: email,
            mattermost: mattermost,
            updatedAt: new Date(updatedAt).getTime(),
        }, fields);
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
