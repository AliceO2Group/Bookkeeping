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
const { DplProcessRepository } = require('../../../database/repositories/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * Find and return a DPL process model by its id or a combination of name and dpl process type id
 *
 * @param {DplProcessIdentifier} processIdentifier the identifier of the DPL process to find
 * @return {Promise<SequelizeDplProcess|null>} the DPL process found or null
 */
exports.getDplProcess = ({ dplProcessId, dplProcessName, dplProcessTypeId }) => {
    const queryBuilder = new QueryBuilder();

    if (dplProcessId) {
        queryBuilder.where('id').is(dplProcessId);
    } else if (dplProcessName && dplProcessTypeId) {
        queryBuilder.where('name').is(dplProcessName);
        queryBuilder.where('typeId').is(dplProcessTypeId);
    } else {
        throw new BadParameterError('Can not find without DPL process id or a couple of (dpl process name, dpl process type id)');
    }

    return DplProcessRepository.findOne(queryBuilder);
};
