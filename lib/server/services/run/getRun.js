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

const { BadParameterError } = require('../../errors/BadParameterError.js');
const { utilities: { QueryBuilder } } = require('../../../database');
const RunRepository = require('../../../database/repositories/RunRepository.js');

/**
 * Find and return a run model by its run number or id
 *
 * @param {RunIdentifier} identifier the criteria to find run
 * @param {function|null} qbConfiguration function called with the run find query builder as parameter to add specific configuration to the
 *     query
 * @return {Promise<SequelizeRun|null>} the run found or null
 */
exports.getRun = ({ runId, runNumber }, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    if (runNumber) {
        queryBuilder.where('runNumber').is(runNumber);
    } else if (runId) {
        queryBuilder.where('id').is(runId);
    } else {
        throw new BadParameterError('Can not find without run id or run number');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return RunRepository.findOne(queryBuilder);
};
