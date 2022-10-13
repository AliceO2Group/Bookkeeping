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

const { getEnvironmentOrFail } = require('./getEnvironmentOrFail.js');
const EnvironmentRepository = require('../../../database/repositories/EnvironmentRepository.js');

/**
 * Update the given environment
 *
 * @param {string} environmentId the id of the environment to update
 * @param {Partial<SequelizeEnvironment>} environmentPatch the patch to apply on the environment
 * @return {Promise<SequelizeEnvironment>} resolve with the updated environment model
 */
exports.updateEnvironment = async (environmentId, environmentPatch) => {
    const environmentModel = await getEnvironmentOrFail(environmentId);
    await EnvironmentRepository.update(environmentModel, environmentPatch);
    return environmentModel;
};
