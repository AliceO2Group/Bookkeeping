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
 * Adapter for templates
 */
class TemplateAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.toEntity = this.toEntity.bind(this);

        /**
         * @type {TemplateModuleAdapter|null}
         */
        this.templateModuleAdapter = null;
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {SequelizeTemplate} databaseObject Object to convert.
     * @returns {Template} Converted entity object.
     */
    toEntity({ id, name, title, description, modules }) {
        const entityObject = {
            id,
            name,
            title,
            description,
        };

        if (modules) {
            entityObject.modules = modules.map(this.templateModuleAdapter.toEntity);
        }

        return entityObject;
    }
}

module.exports = TemplateAdapter;
