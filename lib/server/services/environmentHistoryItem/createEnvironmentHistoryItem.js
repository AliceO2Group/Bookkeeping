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

const { ConflictError } = require('../../errors/ConflictError.js');
const { getEnvironmentOrFail } = require('../environment/getEnvironmentOrFail.js');
const { getEnvironmentHistoryItem } = require('./getEnvironmentHistoryItem.js');
const { EnvironmentHistoryItemRepository } = require('../../../database/repositories/index.js');

/**
 * Create a new environment's history item
 *
 * @param {Partial<SequelizeEnvironmentHistoryItem>} environmentHistoryItem the history item to create
 * @return {Promise<number>} the id of the created item
 */
exports.createEnvironmentHistoryItem = async (environmentHistoryItem) => {
    const { id, environmentId } = environmentHistoryItem;

    // Check that environment exists
    await getEnvironmentOrFail(environmentId);

    if (id) {
        const existingEnvironmentHistoryItem = await getEnvironmentHistoryItem(id);
        if (existingEnvironmentHistoryItem) {
            throw new ConflictError(`An environment's history item already exists with id ${id}`);
        }
    }

    const { id: newEnvironmentHistoryItemId } = await EnvironmentHistoryItemRepository.insert(environmentHistoryItem);
    return newEnvironmentHistoryItemId;
};
