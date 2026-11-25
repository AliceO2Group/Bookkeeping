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

let getStartOfWeek;

module.exports = () => {
    let timeZone;

    before(async () => {
        ({ getStartOfWeek } = await import('../../../../lib/public/utilities/dateUtils.mjs'));
        timeZone = process.env.TZ;
    });

    after(() => {
        if (timeZone === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = timeZone;
        }
    });

    for (const zone of ['America/Los_Angeles', 'UTC', 'Pacific/Auckland']) {
        it(`should start week 47 of 2026 on Monday 16 November at midnight UTC with a clock in ${zone}`, () => {
            process.env.TZ = zone;
            expect(getStartOfWeek(47, 2026).toISOString()).to.equal('2026-11-16T00:00:00.000Z');
        });
    }
};
