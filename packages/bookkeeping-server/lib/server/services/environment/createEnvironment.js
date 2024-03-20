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

const { getEnvironment } = require('./getEnvironment.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const EnvironmentRepository = require('../../../database/repositories/EnvironmentRepository.js');

/**
 * Create an environment in the database and return the auto generated id
 *
 * @param {Partial<SequelizeEnvironment>} newEnvironment the environment to create
 * @return {Promise<string>} resolve once the creation is done providing the id of the environment that have been (or will be) created
 */
exports.createEnvironment = async (newEnvironment) => {
    const { id: environmentId } = newEnvironment;

    if (environmentId) {
        const existingEnvironment = await getEnvironment(environmentId);
        if (existingEnvironment) {
            throw new ConflictError(`An environment already exists with id ${environmentId}`);
        }
    }

    const { id: newEnvironmentId } = await EnvironmentRepository.insert(newEnvironment);
    return newEnvironmentId;
};
