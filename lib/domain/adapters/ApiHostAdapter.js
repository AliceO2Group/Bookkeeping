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
 * APIHostAdapter
 */
class APIHostAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.apiDplProcessExecutionAdapter = null;
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {Environment} apiEntityObject Object to convert.
     * @returns {APIEnvironment} Converted entity object.
     */
    toAPIEntity(apiEntityObject) {
        const { processesExecutions } = apiEntityObject;
        return {
            ...apiEntityObject,
            processesExecutions: (processesExecutions ?? []).map(this.apiDplProcessExecutionAdapter.toAPIEntity),
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIEnvironment} apiEntityObject Object to convert.
     * @returns {Environment} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { processesExecutions } = apiEntityObject;
        return {
            ...apiEntityObject,
            processesExecutions: (processesExecutions ?? []).map(this.apiDplProcessExecutionAdapter.toDomain),
        };
    }
}

exports.APIHostAdapter = APIHostAdapter;
