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
 * APIEnvironmentAdapter
 */
class APIEnvironmentAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.runAdapter = null;

        this.toAPIEntity = this.toAPIEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {Environment} entityObject Object to convert.
     * @returns {APIEnvironment} Converted entity object.
     */
    toAPIEntity(entityObject) {
        const { runs } = entityObject;
        return {
            ...entityObject,
            runs: (runs ?? []).map(this.runAdapter.toAPIEntity),
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APIEnvironment} apiEntityObject Object to convert.
     * @returns {Environment} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { runs } = apiEntityObject;
        return {
            ...apiEntityObject,
            runs: (runs ?? []).map(this.runAdapter.toDomain),
        };
    }
}

exports.APIEnvironmentAdapter = APIEnvironmentAdapter;
