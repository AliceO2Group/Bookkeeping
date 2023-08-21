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

const { getAllEnvironments } = require('./getAllEnvironments.js');

/**
 * Extract all the environments corresponding to a list of environments id. If any do not correspond to an environment, throw an error
 *
 * @param {string[]} [environments] the list of environment ids
 * @return {Promise<SequelizeEnvironment[]>} the list of environments
 */
const getAllEnvironmentsOrFail = async (environments) => {
    if (!environments) {
        return [];
    }

    const envs = await getAllEnvironments(environments);

    const missingEnvironments = environments.filter((text) => !envs.find((env) => text === env.id));
    if (missingEnvironments.length > 0) {
        throw new Error(`Environments ${missingEnvironments.join(', ')} could not be found`);
    }

    return envs;
};

exports.getAllEnvironmentsOrFail = getAllEnvironmentsOrFail;
