/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { dataSource } = require('../../../database/DataSource.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');
const { DataPassVersionRepository } = require('../../../database/repositories/index.js');

/**
 * Find and return a data pass versions by id or name of the data pass
 *
 * @param {DataPassIdentifier} identifier the identifier of the data pass which versions should be fetched
 * @return {Promise<SequelizeDataPassVersion[]>} resolves with the found data pass versions
 */
exports.getDataPassVersions = async ({ id, name }) => {
    const queryBuilder = dataSource.createQueryBuilder();

    if (id !== undefined) {
        queryBuilder.whereAssociation('dataPass', 'id').is(id);
    } else if (name) {
        queryBuilder.whereAssociation('dataPass', 'name').is(name);
    } else {
        throw new BadParameterError('Can not find data pass without id or name');
    }

    return await DataPassVersionRepository.findAll(queryBuilder);
};
