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

const { getAllCtpTriggerCounters } = require('../../../../../lib/server/services/ctpTriggerCounters/getAllCtpTriggerCounters.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return all the trigger counters', async () => {
        const counters = await getAllCtpTriggerCounters();

        expect(counters.length).to.be.greaterThan(1);
        expect(counters.map(({ className }) => className)).to.include.members(['FIRST-CLASS-NAME', 'SECOND-CLASS-NAME']);
    });

    it('should apply the given query builder configuration', async () => {
        const countersOfRun1 = await getAllCtpTriggerCounters((queryBuilder) => queryBuilder.where('runNumber').is(1));
        expect(countersOfRun1.map(({ className }) => className)).to.have.members(['FIRST-CLASS-NAME', 'SECOND-CLASS-NAME']);
        expect(countersOfRun1.every(({ runNumber }) => runNumber === 1)).to.be.true;

        expect(await getAllCtpTriggerCounters((queryBuilder) => queryBuilder.where('runNumber').is(2))).to.eql([]);
    });
};
