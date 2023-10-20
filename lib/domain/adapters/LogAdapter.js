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
 * APILogAdapter
 */
class APILogAdapter {
    /**
     * Constructor
     */
    constructor() {
        this.apiRunAdapter = null;
        this.apiEnvironmentAdapter = null;
        this.apiLhcFillAdapter = null;

        this.toAPIEntity = this.toAPIEntity.bind(this);
        this.toDomain = this.toDomain.bind(this);
    }

    /**
     * Converts the given domain object to an entity object.
     *
     * @param {Log} entityObject Object to convert.
     * @returns {APILog} Converted entity object.
     */
    toAPIEntity(entityObject) {
        const { runs, environments, lhcFills } = entityObject;
        return {
            ...entityObject,
            runs: (runs ?? []).map(this.apiRunAdapter.toAPIEntity),
            environments: (environments ?? []).map(this.apiEnvironmentAdapter.toAPIEntity),
            lhcFills: (lhcFills ?? []).map(this.apiLhcFillAdapter.toAPIEntity),
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APILog} apiEntityObject Object to convert.
     * @returns {Log} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { runs, environments, lhcFills } = apiEntityObject;
        return {
            ...apiEntityObject,
            runs: (runs ?? []).map(this.apiRunAdapter.toDomain),
            environments: (environments ?? []).map(this.apiEnvironmentAdapter.toDomain),
            lhcFills: (lhcFills ?? []).map(this.apiLhcFillAdapter.toDomain),
        };
    }
}

exports.APILogAdapter = APILogAdapter;
