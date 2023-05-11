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

const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getHost } = require('./getHost.js');

/**
 * Find a host model by its id and reject with a NotFoundError if none is found
 *
 * @param {number} hostId the id of the host to find
 * @return {Promise<SequelizeHost>} resolve with the host model found or reject with a NotFoundError
 */
exports.getHostOrFail = async (hostId) => {
    const hostModel = await getHost(hostId);

    if (hostModel !== null) {
        return hostModel;
    } else {
        throw new NotFoundError('Host with this id could not be found');
    }
};
