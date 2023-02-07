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
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find an environment model by its id and reject with a NotFoundError if none is found
 *
 * @param {string} environmentId the id of the environment to find
 * @param {function} [qbConfiguration] function called with the environment find query builder as parameter to add specific configuration to
 *     the query
 * @return {Promise<SequelizeEnvironment>} resolve with the environment model found or reject with a NotFoundError
 */
exports.getEnvironmentOrFail = async (environmentId, qbConfiguration) => {
    const environmentModel = await getEnvironment(environmentId, qbConfiguration);
    if (environmentModel !== null) {
        return environmentModel;
    } else {
        throw new NotFoundError(`Environment with this id (${environmentId}) could not be found`);
    }
};
