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
 * APIRunAdapter
 */
class APIRunAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.lhcFillAdapter = null;
        this.flpRoleAdapter = null;
        this.logAdapter = null;

        this.toAPIEntity = this.toAPIEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given database object to an entity object.
     *
     * @param {Run} entityObject Object to convert.
     * @returns {APIRun} Converted entity object.
     */
    toAPIEntity(entityObject) {
        const { lhcPeriod, lhcFill, flpRoles, logs } = entityObject;
        return {
            ...entityObject,
            lhcPeriod: lhcPeriod?.name,
            lhcFill: lhcFill ?
                this.lhcFillAdapter.toAPIEntity(lhcFill)
                : lhcFill,
            flpRoles: flpRoles ?
                flpRoles.map(this.flpRoleAdapter.toAPIEntity)
                : flpRoles,
            logs: logs ?
                logs.map(this.logAdapter.toAPIEntity)
                : logs,
        };
    }

    /**
     * Converts the given entity object to a database object.
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
                this.lhcFillAdapter.toDomain(lhcFill)
                : lhcFill,
            flpRoles: flpRoles ?
                flpRoles.map(this.flpRoleAdapter.toDomain)
                : flpRoles,
            logs: logs ?
                logs.map(this.logAdapter.toDomain)
                : logs,
        };
    }
}

exports.APIRunAdapter = APIRunAdapter;
