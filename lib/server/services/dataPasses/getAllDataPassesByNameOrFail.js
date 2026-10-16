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

const { getOneDataPassOrFail } = require('./getOneDataPassOrFail.js');

/**
 * Extract all the data passes corresponding to a list of data pass names. If any do not correspond to a data pass, throw an error
 *
 * @param {string[]} [dataPassNames] the list of data pass names
 * @return {Promise<SequelizeDataPass[]>} the list of data passes
 */
const getAllDataPassesByNameOrFail = async (dataPassNames) => {
    const dataPasses = [];
    for (const name of dataPassNames ?? []) {
        dataPasses.push(await getOneDataPassOrFail({ name }));
    }

    return dataPasses;
};

exports.getAllDataPassesByNameOrFail = getAllDataPassesByNameOrFail;
