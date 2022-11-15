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

const { getRunType } = require('./getRunType.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const { RunTypeRepository } = require('../../../database/repositories/index.js');

/**
 * Create a run type in the database and return the auto generated id
 *
 * @param {Partial<SequelizeRunType>} runType the run type to create
 * @param {boolean} skipDuplicateCheck if true, no check will be done to see if the given run type already exists
 * @return {Promise<number>} resolve once the creation is done providing the id of the run type that have been (or will be) created
 */
exports.createRunType = async (runType, skipDuplicateCheck = false) => {
    const { name } = runType;

    if (!skipDuplicateCheck && name) {
        const existingRunType = await getRunType({ name });
        if (existingRunType) {
            throw new ConflictError(`A run type already exists with name ${name}`);
        }
    }

    const { /** @type {number} id */ id } = await RunTypeRepository.insert(runType);
    return id;
};
