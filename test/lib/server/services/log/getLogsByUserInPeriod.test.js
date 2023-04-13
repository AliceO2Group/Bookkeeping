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
const { getLogsByUserInPeriod } = require('../../../../../lib/server/services/log/getLogsByUserInPeriod.js');

module.exports = () => {
    const limit1 = new Date('2000-01-01 12:00:00').getTime();
    const limit2 = new Date('2019-11-11 17:00:00').getTime();
    const limit3 = new Date('2019-11-11 9:00:00').getTime();
    const limit4 = new Date('2019-11-11 12:00:00').getTime();

    it('should successfully retrieve the logs created between specific dates by a given user', async () => {
        {
            const logs = await getLogsByUserInPeriod({ id: 1 }, { from: limit1, to: limit2 });
            expect(logs).to.lengthOf(4);
            expect(logs.every(({ user }) => user.id === 1)).to.be.true;
        }
        {
            const logs = await getLogsByUserInPeriod({ id: 2 }, { from: limit1, to: limit2 });
            expect(logs).to.lengthOf(113);
            expect(logs.every(({ user }) => user.id === 2)).to.be.true;
        }
        {
            const logs = await getLogsByUserInPeriod({ id: 1 }, { from: limit1, to: limit3 });
            expect(logs).to.lengthOf(1);
            expect(logs.every(({ user }) => user.id === 1)).to.be.true;
        }
    });

    it('should successfully include logs at the lower limit but exclude logs at the upper limit for a given user', async () => {
        const logs = await getLogsByUserInPeriod({ id: 1 }, { from: limit1, to: limit4 });
        expect(logs).to.lengthOf(1);
        expect(logs.every(({ user }) => user.id === 1)).to.be.true;
    });

    it('should successfully include the expected relations', async () => {
        const limit5 = new Date('2020-01-01 12:00:00').getTime();
        const limit6 = new Date('2021-11-11 12:00:00').getTime();

        {
            const [log] = await getLogsByUserInPeriod({ id: 1 }, { from: limit5, to: limit6 }, { tags: true });
            expect(log.tags?.map(({ text }) => text)).to.eql(['RUN', 'DPG']);
        }

        {
            const [log] = await getLogsByUserInPeriod({ id: 1 }, { from: limit5, to: limit6 });
            expect(log.tags).to.be.undefined;
        }
    });
};
