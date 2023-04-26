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

const { expect } = require('chai');
const { getLogsByTagsInPeriod } = require('../../../../../lib/server/services/log/getLogsByTagsInPeriod.js');

module.exports = () => {
    const limit1 = new Date('2019-11-11 12:00:00').getTime();
    const limit2 = new Date('2019-11-11 14:00:00').getTime();
    const limit3 = new Date('2020-02-02 13:00:00').getTime();

    it('should successfully retrieve the logs with the given tags created between specific dates', async () => {
        {
            const logs = await getLogsByTagsInPeriod({ include: ['FOOD'] }, { from: limit1, to: limit2 });
            expect(logs).to.lengthOf(2);
            expect(logs.every(({ tags }) => tags.some(({ text }) => text === 'FOOD'))).to.be.true;
        }

        {
            const logs = await getLogsByTagsInPeriod({ include: ['RUN'] }, { from: limit1, to: limit3 });
            expect(logs).to.lengthOf(2);
            expect(logs.every(({ tags }) => tags.some(({ text }) => text === 'RUN'))).to.be.true;
        }

        {
            const logs = await getLogsByTagsInPeriod({ include: ['FOOD', 'RUN'] }, { from: limit1, to: limit3 });
            expect(logs).to.lengthOf(4);
            expect(logs.every(({ tags }) => tags.some(({ text }) => text === 'RUN' || text === 'FOOD'))).to.be.true;
        }
    });

    it('should successfully retrieve the root logs with the given tags created between specific dates', async () => {
        {
            // All logs in the criteria has a parent
            const logs = await getLogsByTagsInPeriod({ include: ['FOOD'] }, { from: limit1, to: limit2 }, { rootOnly: true });
            expect(logs).to.lengthOf(0);
            expect(logs.every(({ tags }) => tags.some(({ text }) => text === 'FOOD'))).to.be.true;
        }

        {
            // Only log with id 5 will be kept, the other have a parent
            const logs = await getLogsByTagsInPeriod(
                { include: ['RUN'] },
                { from: limit1, to: limit3 },
                { rootOnly: true },
            );
            expect(logs).to.lengthOf(1);
            expect(logs.every(({ tags }) => tags.some(({ text }) => text === 'RUN'))).to.be.true;
        }

        {
            // Only log with id 5 will be kept, the 3 other have a parent
            const logs = await getLogsByTagsInPeriod(
                { include: ['FOOD', 'RUN'] },
                { from: limit1, to: limit3 },
                { rootOnly: true },
            );
            expect(logs).to.lengthOf(1);
            expect(logs.every(({ tags }) => tags.some(({ text }) => text === 'RUN' || text === 'FOOD'))).to.be.true;
        }
    });

    it('should successfully include logs at the lower limit but exclude logs at the upper limit for given tags', async () => {
        const limit4 = new Date('2020-01-01 12:00:00').getTime();
        const limit5 = new Date('2021-11-11 12:00:00').getTime();

        const [log] = await getLogsByTagsInPeriod({ include: ['RUN'] }, { from: limit4, to: limit5 });
        expect(log.tags?.map(({ text }) => text)).to.eql(['RUN', 'DPG']);
    });
};
