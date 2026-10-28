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
 * Adapter for template modules
 */
class TemplateModuleAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeTemplateModule} databaseObject Object to convert.
     * @returns {TemplateModule} Converted entity object.
     */
    toEntity({ position, type, title, options }) {
        return {
            position,
            type,
            title,
            options,
        };
    }
}

module.exports = TemplateModuleAdapter;
