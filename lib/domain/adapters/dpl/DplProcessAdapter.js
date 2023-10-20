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
 * APIDplProcessAdapter
 */
class APIDplProcessAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.dplProcessExecutionAdapter = null;

        this.toAPIEntity = this.toAPIEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {DplProcess} entityObject Object to convert.
     * @returns {APIDplProcess} Converted entity object.
     */
    toAPIEntity(entityObject) {
        const { processesExecutions } = entityObject;
        return {
            ...entityObject,
            processesExecutions: (processesExecutions ?? [])
                .map(this.dplProcessExecutionAdapter.toAPIEntity),
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIDplProcess} apiEntityObject Object to convert.
     * @returns {DplProcess} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { processesExecutions } = apiEntityObject;
        return {
            ...apiEntityObject,
            processesExecutions: (processesExecutions ?? [])
                .map(this.dplProcessExecutionAdapter.toDomain),
        };
    }
}

exports.DplProcessAdapter = APIDplProcessAdapter;
