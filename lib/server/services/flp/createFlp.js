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

const { getFlp } = require('./getFlp.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const FlpRepository = require('../../../database/repositories/FlpRepository.js');
const { getRunOrFail } = require('../run/getRunOrFail.js');
const FlpRunsRepository = require('../../../database/repositories/FlpRunsRepository.js');
const { utilities: { TransactionHelper } } = require('../../../database');

/**
 * Create an FLP in the database and return the auto generated id
 *
 * @param {Partial<SequelizeFlp>} flp the flp to create
 * @param {number} [runNumber] optionally the run number to which flp must be linked
 * @return {Promise<number>} resolve once the creation is done providing the id of the flp that have been (or will be) created
 */
exports.createFlp = async (flp, runNumber) => {
    const { id: flpId } = flp;

    if (flpId) {
        const existingFlp = await getFlp(flpId);
        if (existingFlp) {
            throw new ConflictError(`An FLP already exists with id ${flpId}`);
        }
    }

    let runId = null;
    if (runNumber) {
        ({ id: runId } = await getRunOrFail({ runNumber }));
    }

    return TransactionHelper.provide(async () => {
        const { /** @type {number} id */ id: newFlpId } = await FlpRepository.insert(flp);

        if (runId) {
            await FlpRunsRepository.insert({ flpRoleId: newFlpId, runId });
        }

        return newFlpId;
    });
};
