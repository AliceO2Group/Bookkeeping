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

const { runTypeAdapter } = require('../../../database/adapters/index.js');
const { ApiConfig } = require('../../../config/index.js');
const { getAllRunTypes } = require('./getAllRunTypes.js');
const { getRunTypeOrFail } = require('./getRunTypeOrFail.js');

/**
 * Global service to read run types
 */
class RunTypeService {
    /**
     * Return the run types sorted by name (descending)
     *
     * Run types are not paginated, but the result is capped to the maximum number of items of the API as run types can be created automatically
     *
     * @return {Promise<RunType[]>} the run types
     */
    async getAll() {
        return (await getAllRunTypes((queryBuilder) => {
            queryBuilder.orderBy('name', 'desc');
            queryBuilder.limit(ApiConfig.pagination.limit);
        })).map(runTypeAdapter.toEntity);
    }

    /**
     * Return the run type matching the given identifier, or reject if there is none
     *
     * @param {RunTypeIdentifier} identifier the identifier of the run type to find
     * @return {Promise<RunType>} resolves with the run type found or rejects with a NotFoundError
     */
    async getOneOrFail(identifier) {
        return runTypeAdapter.toEntity(await getRunTypeOrFail(identifier));
    }
}

exports.RunTypeService = RunTypeService;

exports.runTypeService = new RunTypeService();
