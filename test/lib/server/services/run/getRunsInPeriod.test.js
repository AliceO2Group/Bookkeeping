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

const { getRunsInPeriod } = require('../../../../../lib/server/services/run/getRunsInPeriod.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return all the runs in a given period', async () => {
        expect(await getRunsInPeriod({ from: Date.now() - 5 * 60 * 1000, to: Date.now() })).to.lengthOf(0);

        expect((await getRunsInPeriod({
            from: new Date('2022-03-21T10:00:00Z').getTime(),
            to: new Date('2022-03-21T22:00:00Z').getTime(),
        })).map(({ runNumber }) => runNumber)).to.eql([1]);

        expect((await getRunsInPeriod({
            from: new Date('2022-03-21T15:00:00Z').getTime(),
            to: new Date('2022-03-21T22:00:00Z').getTime(),
        })).map(({ runNumber }) => runNumber)).to.eql([1]);

        expect((await getRunsInPeriod({
            from: new Date('2022-03-21T10:00:00Z').getTime(),
            to: new Date('2022-03-21T13:00:00Z').getTime(),
        })).map(({ runNumber }) => runNumber)).to.lengthOf(0);

        const period = {
            from: new Date('2019-08-08T12:00:00Z').getTime(),
            to: new Date('2019-08-08T14:00:00Z').getTime(),
        };
        const runs = await getRunsInPeriod(period);
        for (const run of runs) {
            const start = new Date(run.timeTrgStart ?? run.timeO2Start);
            const end = new Date(run.timeTrgEnd ?? run.timeO2End ?? Date.now());
            expect(start <= period.to).to.be.true;
            expect(end >= period.from).to.be.true;
            // No pending runs, they are after 48 hours
        }
    });
};
