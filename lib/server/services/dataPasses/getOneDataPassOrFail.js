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

const { getOneDataPass } = require('./getOneDataPass.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find and return a data pass by its id or name, and throw if none is found
 *
 * @param {DataPassIdentifier} identifier the identifier of the data pass to fetch
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the data pass find query builder as parameter to add
 *     specific configuration to the query
 * @return {Promise<SequelizeDataPass>} resolves with the found data pass
 */
exports.getOneDataPassOrFail = async (identifier, qbConfiguration = null) => {
    const dataPass = await getOneDataPass(identifier, qbConfiguration);

    if (!dataPass) {
        const { id, name } = identifier;
        const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
        throw new NotFoundError(`Data pass with this ${criteriaExpression} could not be found`);
    }

    return dataPass;
};
