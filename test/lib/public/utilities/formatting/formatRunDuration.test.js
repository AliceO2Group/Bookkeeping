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

let formatRunDuration;

module.exports = () => {
    before(async () => {
        ({ formatRunDuration } = await import('../../../../../lib/public/utilities/formatting/formatRunDuration.mjs'));
    });

    it('should successfully format run duration for a run that has ended after less than 48 hours', () => {
        expect(formatRunDuration({
            runDuration: (3 * 3600 + 17 * 60 + 39) * 1000,
            timeTrgStart: 10,
            timeTrgEnd: 100,
            timeO2Start: null,
            timeO2End: null,
        })).to.equal('03:17:39');

        expect(formatRunDuration({
            runDuration: (12 * 60 + 34) * 1000,
            timeTrgStart: 10,
            timeTrgEnd: 100,
            timeO2Start: null,
            timeO2End: null,
        })).to.equal('00:12:34');

        expect(formatRunDuration({
            runDuration: 58 * 1000,
            timeTrgStart: 10,
            timeTrgEnd: 100,
            timeO2Start: null,
            timeO2End: null,
        })).to.equal('00:00:58');

        expect(formatRunDuration({
            runDuration: 58 * 1000,
            timeTrgStart: 10,
            timeTrgEnd: 10,
        })).to.equal('00:00:58');
    });

    it('should successfully return \'-\' for a run that has no duration', () => {
        expect(formatRunDuration({
            runDuration: undefined,
            timeTrgStart: 10,
            timeTrgEnd: 100,
            timeO2Start: null,
            timeO2End: null,
        })).to.equal('-');

        expect(formatRunDuration({
            runDuration: null,
            timeTrgStart: 10,
            timeTrgEnd: 100,
            timeO2Start: null,
            timeO2End: null,
        })).to.equal('-');

        expect(formatRunDuration({
            runDuration: null,
            timeTrgStart: 10,
            timeTrgEnd: 10,
        })).to.equal('-');

        expect(formatRunDuration({
            runDuration: null,
            timeO2Start: 10,
            timeTrgEnd: 20,
        })).to.equal('-');

        expect(formatRunDuration({
            runDuration: null,
            timeTrgStart: 10,
            timeO2End: 20,
        })).to.equal('-');
    });

    it('should successfully return RUNNING for a run that has not ended after less than 48 hours', () => {
        const now = new Date();

        expect(formatRunDuration({
            runDuration: 9184,
            timeTrgStart: now - 49 * 3600 * 1000,
        })).to.equal('UNKNOWN');

        expect(formatRunDuration({
            runDuration: 1048,
            timeO2Start: now - 49 * 3600 * 1000,
        })).to.equal('UNKNOWN');
    });

    it('should successfully return UNKNOWN for a run that last for more than 48 hours', () => {
        const now = new Date();

        expect(formatRunDuration({
            runDuration: 2984,
            timeTrgStart: now - 24 * 3600 * 1000,
        })).to.equal('RUNNING');

        expect(formatRunDuration({
            runDuration: 10384,
            timeO2Start: now - 24 * 3600 * 1000,
        })).to.equal('RUNNING');
    });
};
