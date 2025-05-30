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
 * UserAdapter
 */
class UserAdapter {
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
     * @param {SequelizeUser} databaseObject Object to convert.
     * @returns {User} Converted entity object.
     */
    toEntity(databaseObject) {
        if (databaseObject) {
            return {
                id: databaseObject.id,
                externalId: databaseObject.externalId,
                name: databaseObject.name,
            };
        } else {
            return {
                id: 0,
                externalId: 0,
                name: 'Anonymous',
            };
        }
    }

    /**
     * Return a user object by keeping only its name
     *
     * @param {SequelizeUser} databaseObject the full user object
     * @return {{name: string}} the user with only name property
     */
    toNameOnly(databaseObject) {
        return { name: databaseObject.name };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<User>} entityObject Object to convert.
     * @returns {Partial<SequelizeUser>} Converted database object.
     */
    toDatabase(entityObject) {
        return entityObject;
    }
}

module.exports = UserAdapter;
