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
 * ApiRunAdapter
 */
class ApiRunAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.apiLhcFillAdapter = null;
        this.apiFlpRoleAdapter = null;
        this.apiLogAdapter = null;

        this.toApiEntity = this.toApiEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {Run} entityObject Object to convert.
     * @returns {APIRun} Converted entity object.
     */
    toApiEntity(entityObject) {
        const { lhcPeriod, lhcFill, flpRoles, logs } = entityObject;
        return {
            ...entityObject,
            lhcPeriod: lhcPeriod?.name,
            lhcFill: lhcFill ?
                this.apiLhcFillAdapter.toApiEntity(lhcFill)
                : lhcFill,
            flpRoles: flpRoles ?
                flpRoles.map(this.apiFlpRoleAdapter.toApiEntity)
                : flpRoles,
            logs: logs ?
                logs.map(this.apiLogAdapter.toApiEntity)
                : logs,
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIRun} apiEntityObject Object to convert.
     * @returns {Run} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { lhcPeriod, lhcFill, flpRoles, logs } = apiEntityObject;
        return {
            ...apiEntityObject,
            lhcPeriod: lhcPeriod ? { name: lhcPeriod } : lhcPeriod,
            lhcFill: lhcFill ?
                this.apiLhcFillAdapter.toDomain(lhcFill)
                : lhcFill,
            flpRoles: flpRoles ?
                flpRoles.map(this.apiFlpRoleAdapter.toDomain)
                : flpRoles,
            logs: logs ?
                logs.map(this.apiLogAdapter.toDomain)
                : logs,
        };
    }
}

exports.ApiRunAdapter = ApiRunAdapter;
