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

const { CtpTriggerCountersRepository } = require('../../../database/repositories/index.js');

/**
 * Create the counters of a trigger class of a run, or update them if they already exist
 *
 * @param {object} criteria the criteria identifying the counters to create or update
 * @param {number} criteria.runNumber the run number of the run for which counters are created or updated
 * @param {string} criteria.className the name of the trigger class for which counters are created or updated
 * @param {Pick<CtpTriggerCounters, 'timestamp'|'lmb'|'lma'|'l0b'|'l0a'|'l1b'|'l1a'>} counters the actual counters data
 * @return {Promise<void>} resolves once the counters have been created or updated
 */
exports.createOrUpdateCtpTriggerCounters = async ({ runNumber, className }, counters) => {
    await CtpTriggerCountersRepository.upsert({
        runNumber,
        className,
        timestamp: counters.timestamp,
        lmb: counters.lmb,
        lma: counters.lma,
        l0b: counters.l0b,
        l0a: counters.l0a,
        l1b: counters.l1b,
        l1a: counters.l1a,
    });
};
