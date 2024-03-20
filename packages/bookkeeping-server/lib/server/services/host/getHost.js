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

const { utilities: { QueryBuilder } } = require('../../../database');
const { HostRepository } = require('../../../database/repositories/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * Find and return a host model by its id or hostname
 *
 * @param {HostIdentifier} hostIdentifier the id of the host to find
 * @return {Promise<SequelizeHost|null>} the host found or null
 */
exports.getHost = ({ hostId, hostname }) => {
    const queryBuilder = new QueryBuilder();
    if (hostId) {
        queryBuilder.where('id').is(hostId);
    } else if (hostname) {
        queryBuilder.where('hostname').is(hostname);
    } else {
        throw new BadParameterError('Can not find without host id or hostname');
    }

    return HostRepository.findOne(queryBuilder);
};
