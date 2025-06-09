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
const { getShiftFromTimestamp } = require('../../../../../lib/server/services/shift/getShiftFromTimestamp.js');

module.exports = () => {
    it('should successfully compute night shifts in winter time', () => {
        const expectedShift = {
            start: new Date('2023-12-31T22:00:00Z').getTime(),
            end: new Date('2024-01-01T06:00:00Z').getTime(),
            period: 'Night',
        };
        expect(getShiftFromTimestamp(new Date('2023-12-31T22:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-01-01T05:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-01-01T05:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute morning shifts in winter time', () => {
        const expectedShift = {
            start: new Date('2024-01-01T06:00:00Z').getTime(),
            end: new Date('2024-01-01T14:00:00Z').getTime(),
            period: 'Morning',
        };
        expect(getShiftFromTimestamp(new Date('2024-01-01T06:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-01-01T13:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-01-01T13:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute afternoon shifts in winter time', () => {
        const expectedShift = {
            start: new Date('2024-01-01T14:00:00Z').getTime(),
            end: new Date('2024-01-01T22:00:00Z').getTime(),
            period: 'Afternoon',
        };
        expect(getShiftFromTimestamp(new Date('2024-01-01T14:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-01-01T21:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-01-01T21:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute night shifts in summer time', () => {
        const expectedShift = {
            start: new Date('2024-07-31T21:00:00Z').getTime(),
            end: new Date('2024-08-01T05:00:00Z').getTime(),
            period: 'Night',
        };
        expect(getShiftFromTimestamp(new Date('2024-07-31T21:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-08-01T04:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-08-01T04:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute morning shifts in summer time', () => {
        const expectedShift = {
            start: new Date('2024-08-01T05:00:00Z').getTime(),
            end: new Date('2024-08-01T13:00:00Z').getTime(),
            period: 'Morning',
        };
        expect(getShiftFromTimestamp(new Date('2024-08-01T05:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-08-01T12:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-08-01T12:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute afternoon shifts in summer time', () => {
        const expectedShift = {
            start: new Date('2024-08-01T13:00:00Z').getTime(),
            end: new Date('2024-08-01T21:00:00Z').getTime(),
            period: 'Afternoon',
        };
        expect(getShiftFromTimestamp(new Date('2024-08-01T13:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-08-01T20:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-08-01T20:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute night shifts moving from UTC+2 to UTC+1', () => {
        const expectedShift = {
            start: new Date('2023-10-28T21:00:00Z').getTime(),
            end: new Date('2023-10-29T06:00:00Z').getTime(),
            period: 'Night',
        };
        expect(getShiftFromTimestamp(new Date('2023-10-28T21:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2023-10-29T01:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2023-10-29T02:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2023-10-29T05:59:59.999Z').getTime())).to.eql(expectedShift);
    });

    it('should successfully compute night shifts moving from UTC+1 to UTC+2', () => {
        const expectedShift = {
            start: new Date('2024-03-30T22:00:00Z').getTime(),
            end: new Date('2024-03-31T05:00:00Z').getTime(),
            period: 'Night',
        };
        expect(getShiftFromTimestamp(new Date('2024-03-30T22:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-03-31T01:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-03-31T02:00:00Z').getTime())).to.eql(expectedShift);
        expect(getShiftFromTimestamp(new Date('2024-03-31T04:59:59.999Z').getTime())).to.eql(expectedShift);
    });
};
