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
const { getShiftFromTimestamp } = require('../../../../../lib/server/services/eosReport/getShiftFromTimestamp.js');

module.exports = () => {
    const nightStart1 = new Date('2023-03-15T22:00:00Z').getTime();
    const morningStart = new Date('2023-03-16T06:00:00Z').getTime();
    const afternoonStart = new Date('2023-03-16T14:00:00Z').getTime();
    const nightStart2 = new Date('2023-03-16T22:00:00Z').getTime();

    const summerNightStart1 = new Date('2023-06-15T21:00:00Z').getTime();
    const summerMorningStart = new Date('2023-06-16T05:00:00Z').getTime();
    const summerAfternoonStart = new Date('2023-06-16T13:00:00Z').getTime();
    const summerNightStart2 = new Date('2023-06-16T21:00:00Z').getTime();

    it('should successfully recognize night shift', () => {
        const night1 = new Date('2023-03-15T22:00:00Z');
        expect(getShiftFromTimestamp(night1.getTime())).to.eql({
            start: nightStart1,
            end: morningStart,
            period: 'Night',
        });

        const night2 = new Date('2023-03-16T02:16:23Z');
        expect(getShiftFromTimestamp(night2.getTime())).to.eql({
            start: nightStart1,
            end: morningStart,
            period: 'Night',
        });

        const summerNight1 = new Date('2023-06-15T22:00:00Z');
        expect(getShiftFromTimestamp(summerNight1.getTime())).to.eql({
            start: summerNightStart1,
            end: summerMorningStart,
            period: 'Night',
        });

        const summerNight2 = new Date('2023-06-16T02:16:23Z');
        expect(getShiftFromTimestamp(summerNight2.getTime())).to.eql({
            start: summerNightStart1,
            end: summerMorningStart,
            period: 'Night',
        });
    });

    it('should successfully recognize morning shift', () => {
        const morning1 = new Date('2023-03-16T06:00:00Z');
        expect(getShiftFromTimestamp(morning1.getTime())).to.eql({
            start: morningStart,
            end: afternoonStart,
            period: 'Morning',
        });

        const morning2 = new Date('2023-03-16T10:42:10Z');
        expect(getShiftFromTimestamp(morning2.getTime())).to.eql({
            start: morningStart,
            end: afternoonStart,
            period: 'Morning',
        });

        const summerMorning1 = new Date('2023-06-16T06:00:00Z');
        expect(getShiftFromTimestamp(summerMorning1.getTime())).to.eql({
            start: summerMorningStart,
            end: summerAfternoonStart,
            period: 'Morning',
        });

        const summerMorning2 = new Date('2023-06-16T10:42:10Z');
        expect(getShiftFromTimestamp(summerMorning2.getTime())).to.eql({
            start: summerMorningStart,
            end: summerAfternoonStart,
            period: 'Morning',
        });
    });

    it('should successfully recognize afternoon shift', () => {
        const afternoon1 = new Date('2023-03-16T14:00:00Z');
        expect(getShiftFromTimestamp(afternoon1.getTime())).to.eql({
            start: afternoonStart,
            end: nightStart2,
            period: 'Afternoon',
        });

        const afternoon2 = new Date('2023-03-16T17:19:23Z');
        expect(getShiftFromTimestamp(afternoon2.getTime())).to.eql({
            start: afternoonStart,
            end: nightStart2,
            period: 'Afternoon',
        });

        const summerAfternoon1 = new Date('2023-06-16T14:00:00Z');
        expect(getShiftFromTimestamp(summerAfternoon1.getTime())).to.eql({
            start: summerAfternoonStart,
            end: summerNightStart2,
            period: 'Afternoon',
        });

        const summerAfternoon2 = new Date('2023-06-16T17:19:23Z');
        expect(getShiftFromTimestamp(summerAfternoon2.getTime())).to.eql({
            start: summerAfternoonStart,
            end: summerNightStart2,
            period: 'Afternoon',
        });
    });
};
