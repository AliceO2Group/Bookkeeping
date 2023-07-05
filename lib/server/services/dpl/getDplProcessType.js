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
const { DplProcessTypeRepository } = require('../../../database/repositories/index.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * Find and return a DPL process type model by its id or label
 *
 * @param {DplProcessTypeIdentifier} processTypeIdentifier the identifier of the DPL process type to find
 * @return {Promise<SequelizeDplProcessType|null>} the DPL process type found or null
 */
exports.getDplProcessType = ({ dplProcessTypeId, dplProcessTypeLabel }) => {
    const queryBuilder = new QueryBuilder();

    if (dplProcessTypeId) {
        queryBuilder.where('id').is(dplProcessTypeId);
    } else if (dplProcessTypeLabel) {
        queryBuilder.where('label').is(dplProcessTypeLabel);
    } else {
        throw new BadParameterError('Can not find without dpl process type id or label');
    }

    return DplProcessTypeRepository.findOne(queryBuilder);
};
