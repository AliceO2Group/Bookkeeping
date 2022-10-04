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
 * SubsystemAdapter
 */
class SubsystemAdapter {
    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeSubsystem} databaseObject Object to convert.
     * @returns {Subsystem} Converted entity object.
     */
    static toEntity({ id, name }) {
        return { id, name };
    }

    /**
     * Converts the given entity object to a database object.
     *
     * @param {Partial<Subsystem>} entityObject Object to convert.
     * @returns {Partial<SequelizeSubsystem>} Converted database object.
     */
    static toDatabase(entityObject) {
        return entityObject;
    }
}

module.exports = SubsystemAdapter;
