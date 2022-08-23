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

const {
    repositories: { RunRepository },
    utilities: { QueryBuilder },
} = require('../../database');

/**
 * Find a run by its run number or run id, and throw an error if no run is found
 *
 * @param {{runId: (number|undefined), runNumber: (number|undefined)}} criteria the criteria to find run, either its id or run number
 * @return {Promise<Object>} the corresponding run
 */
const getRunOrFail = async ({ runId, runNumber }) => {
    const queryBuilder = runId
        ? new QueryBuilder().where('id').is(runId)
        : new QueryBuilder().where('runNumber').is(runNumber);

    const run = await RunRepository.findOne(queryBuilder);

    if (!run) {
        const runCriteria = runId ? `id (${runId})` : `runNumber (${runNumber})`;
        throw new Error(`Run with this ${runCriteria} could not be found`);
    }

    return run;
};

exports.getRunOrFail = getRunOrFail;
