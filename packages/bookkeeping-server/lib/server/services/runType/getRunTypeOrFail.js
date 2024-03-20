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
const { getRunType } = require('./getRunType.js');

/**
 * Find a run type model by its name or id and reject with a NotFoundError if none is found
 *
 * @param {RunTypeIdentifier} identifier the identifier of the run type to find
 * @return {Promise<SequelizeRunType>} resolve with the run type model found or reject with a NotFoundError
 */
exports.getRunTypeOrFail = async (identifier) => {
    const runTypeModel = await getRunType(identifier);
    if (runTypeModel !== null) {
        return runTypeModel;
    } else {
        const criteriaExpression = identifier.id ? `id (${identifier.id})` : `name (${identifier.name})`;
        throw new NotFoundError(`Run type with this ${criteriaExpression} could not be found`);
    }
};
