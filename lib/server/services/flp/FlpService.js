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

const { createFlp } = require('./createFlp.js');
const { getFlp } = require('./getFlp.js');
const { flpAdapter } = require('../../../database/adapters/index.js');

/**
 * Global service to handle FLP instances
 */
class FlpService {
    /**
     * Find and return an FLP by its id
     *
     * @param {number} flpId the id of the flp to find
     * @return {Promise<Flp|null>} resolve with the flp found or null
     */
    async get(flpId) {
        const flp = await getFlp(flpId, (queryBuilder) => {
            queryBuilder.include('runs');
        });
        return flp ? flpAdapter.toEntity(flp) : null;
    }

    /**
     * Create an FLP in the database and return the created instance
     *
     * @param {Partial<Flp>} newFlp the FLP to create
     * @param {number} [runNumber] optionally the run number representing run to attach to created FLP
     * @return {Promise<Flp>} resolve with the created flp instance
     */
    async create(newFlp, runNumber) {
        const flpId = await createFlp(flpAdapter.toDatabase(newFlp), runNumber);
        return this.get(flpId);
    }
}

exports.FlpService = FlpService;

exports.flpService = new FlpService();
