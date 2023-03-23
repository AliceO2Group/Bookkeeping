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

const { shiftService } = require('../../../../../lib/server/services/shift/ShiftService.js');
const { expect } = require('chai');

module.exports = () => {
    const shift1 = new Date('2020-02-02 12:00:00').getTime();
    const shift2 = new Date('2019-11-11 12:00:00').getTime();

    it('Should successfully return the logs related to a given shift', async () => {
        shiftService.issuesLogEntriesTags = ['RUN'];
        {
            const logs = await shiftService.getShiftIssues(shift1, { userId: 1 });
            expect(logs).to.lengthOf(1);
            expect(logs[0].id).to.equal(2);
        }
        {
            const logs = await shiftService.getShiftIssues(shift2, { userId: 1 });
            expect(logs).to.lengthOf(4);
            expect(logs.every((log) => log.tags.some(({ text }) => text === 'RUN') || log.author?.id === 1)).to.be.true;
        }
    });
};
