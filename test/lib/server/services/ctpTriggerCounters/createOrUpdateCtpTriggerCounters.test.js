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

const { createOrUpdateCtpTriggerCounters } = require('../../../../../lib/server/services/ctpTriggerCounters/createOrUpdateCtpTriggerCounters.js');
const { getAllCtpTriggerCounters } = require('../../../../../lib/server/services/ctpTriggerCounters/getAllCtpTriggerCounters.js');
const { expect } = require('chai');

/**
 * Return the counters of a given trigger class of a given run
 *
 * @param {number} runNumber the run number
 * @param {string} className the name of the trigger class
 * @return {Promise<SequelizeCtpTriggerCounters[]>} the counters found
 */
const getCounters = (runNumber, className) => getAllCtpTriggerCounters((queryBuilder) => {
    queryBuilder.where('runNumber').is(runNumber);
    queryBuilder.where('className').is(className);
});

module.exports = () => {
    const criteria = { runNumber: 2, className: 'CREATE-OR-UPDATE-CLASS' };

    it('should successfully create the counters of a trigger class of a run', async () => {
        expect(await getCounters(criteria.runNumber, criteria.className)).to.eql([]);

        await createOrUpdateCtpTriggerCounters(criteria, { timestamp: 1717425912000, lmb: 1, lma: 2, l0b: 3, l0a: 4, l1b: 5, l1a: 6 });

        const [counters, ...others] = await getCounters(criteria.runNumber, criteria.className);
        expect(others).to.lengthOf(0);
        expect([counters.lmb, counters.lma, counters.l0b, counters.l0a, counters.l1b, counters.l1a]).to.eql([1, 2, 3, 4, 5, 6]);
        expect(new Date(counters.timestamp).getTime()).to.equal(1717425912000);
    });

    it('should successfully update the counters instead of creating new ones when they already exist', async () => {
        await createOrUpdateCtpTriggerCounters(criteria, { timestamp: 1717425913000, lmb: 11, lma: 12, l0b: 13, l0a: 14, l1b: 15, l1a: 16 });

        const [counters, ...others] = await getCounters(criteria.runNumber, criteria.className);
        expect(others).to.lengthOf(0);
        expect([counters.lmb, counters.lma, counters.l0b, counters.l0a, counters.l1b, counters.l1a]).to.eql([11, 12, 13, 14, 15, 16]);
        expect(new Date(counters.timestamp).getTime()).to.equal(1717425913000);
    });
};
