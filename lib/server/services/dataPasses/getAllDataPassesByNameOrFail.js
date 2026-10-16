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

const { repositories: { DataPassRepository }, utilities: { QueryBuilder } } = require('../../../database');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Extract all the data passes (id and name only, without versions) corresponding to a list of data pass names.
 * If any do not correspond to a data pass, throw an error
 *
 * @param {string[]} [dataPassNames] the list of data pass names
 * @return {Promise<{id: number, name: string}[]>} the list of data passes
 */
const getAllDataPassesByNameOrFail = async (dataPassNames) => {
    if (!dataPassNames || dataPassNames.length === 0) {
        return [];
    }

    const queryBuilder = new QueryBuilder()
        .set('attributes', ['id', 'name'])
        .where('name').oneOf(...dataPassNames);

    const dataPasses = await DataPassRepository.findAll(queryBuilder);

    const foundNames = new Set(dataPasses.map(({ name }) => name));
    const missingNames = dataPassNames.filter((name) => !foundNames.has(name));
    if (missingNames.length > 0) {
        throw new NotFoundError(missingNames.length === 1
            ? `Data pass with this name (${missingNames[0]}) could not be found`
            : `Data passes with these names (${missingNames.join(', ')}) could not be found`);
    }

    return dataPasses;
};

exports.getAllDataPassesByNameOrFail = getAllDataPassesByNameOrFail;
