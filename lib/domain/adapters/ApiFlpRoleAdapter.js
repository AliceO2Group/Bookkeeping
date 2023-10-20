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
 * ApiFlpRoleAdapter
 */
class ApiFlpRoleAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.apiRunAdapter = null;

        this.toApiEntity = this.toApiEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {FlpRole} entityObject Object to convert.
     * @returns {APIFlpRole} Converted entity object.
     */
    toApiEntity(entityObject) {
        const { run } = entityObject;
        return {
            ...entityObject,
            run: run ?
                this.apiRunAdapter.toApiEntity(run)
                : run,
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIFlpRole} apiEntityObject Object to convert.
     * @returns {FlpRole} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { run } = apiEntityObject;
        return {
            ...apiEntityObject,
            run: run ?
                this.apiRunAdapter.toDomain(run)
                : run,
        };
    }
}

exports.ApiFlpRoleAdapter = ApiFlpRoleAdapter;
