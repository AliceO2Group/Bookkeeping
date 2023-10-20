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
 * APILhcFillAdapter
 */
class APILhcFillAdapter {
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
     * @param {LhcFill} entityObject Object to convert.
     * @returns {APILhcFill} Converted entity object.
     */
    toApiEntity(entityObject) {
        const { runs } = entityObject;
        return {
            ...entityObject,
            runs: runs ?
                runs.map(this.runAdapter.toAPIEntity)
                : runs,
        };
    }

    /**
     * Converts the given api entity object to a domain object.
     *
     * @param {APILhcFill} apiEntityObject Object to convert.
     * @returns {LhcFill} Converted entity object.
     */
    toDomain(apiEntityObject) {
        const { runs } = apiEntityObject;
        return {
            ...apiEntityObject,
            runs: runs ?
                runs.map(this.runAdapter.toDomain)
                : runs,
        };
    }
}

exports.APILhcFillAdapter = APILhcFillAdapter;
