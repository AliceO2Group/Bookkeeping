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
const { DataPassRepository } = require('../../../database/repositories/index.js');
const { getDataPassVersions } = require('./getDataPassVersions.js');

/**
 * Find and return a data pass by its id or name
 *
 * @param {DataPassIdentifier} identifier the identifier of the data pass to fetch
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the data pass find query builder as parameter to add
 *     specific configuration to the query
 * @return {Promise<SequelizeDataPass|null>} resolves with the found data pass
 */
exports.getOneDataPass = async ({ id, name }, qbConfiguration = null) => {
    const queryBuilder = dataSource.createQueryBuilder();

    if (id !== undefined) {
        queryBuilder.where('id').is(id);
    } else if (name) {
        queryBuilder.where('name').is(name);
    } else {
        throw new BadParameterError('Can not find data pass without id or name');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }

    const dataPass = await DataPassRepository.findOne(queryBuilder) ?? null;
    if (dataPass) {
        dataPass.versions = await getDataPassVersions({ id, name });
    }

    return dataPass;
};
