/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const { getOrCreateLhcPeriod } = require('../../../../../backend/server/services/lhcPeriod/getOrCreateLhcPeriod.js');
const { expect } = require('chai');

module.exports = () => {
    it('should get existing lhc period', async () => {
        const lhcPeriod = await getOrCreateLhcPeriod({ id: 1 });
        expect(lhcPeriod.id).to.equal(1);
        expect(lhcPeriod.name).to.equal('LHC22a');
    });

    it('should create and get new lhc period', async () => {
        const lhcPeriod = await getOrCreateLhcPeriod({ name: 'LHC23zz' });
        expect(lhcPeriod.id).to.equal(4);
        expect(lhcPeriod.name).to.equal('LHC23zz');
    });
};
