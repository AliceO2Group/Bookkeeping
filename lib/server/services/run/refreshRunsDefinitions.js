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

const { getRun } = require('./getRun.js');
const { getRunDefinition } = require('./getRunDefinition.js');
const { updateRun } = require('./updateRun.js');
const { utilities: { TransactionHelper } } = require('../../../database');

/**
 * For each of the given runs, re-compute the definition and update it in the database
 *
 * @param {RunIdentifier[]} runIdentifiers the identifiers of the runs for which definition must be updated
 * @param {Transaction} [transaction] optionally, a transaction in which definition update should be performed
 * @return {Promise<void>} resolves once all the runs has been updated
 */
exports.refreshRunsDefinitions = (
    runIdentifiers,
    transaction,
) => TransactionHelper.provide(
    (transaction) => Promise.all(runIdentifiers.map(async (identifier) => {
        const run = await getRun(identifier, (qb) => qb.include('lhcFill').include('runType'), transaction);
        if (run) {
            const updatedDefinition = getRunDefinition(run);
            if (run.definition !== updatedDefinition) {
                await updateRun(identifier, { definition: updatedDefinition }, null, null, transaction);
            }
        }
    })),
    { transaction },
);
