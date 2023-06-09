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

const { RunDefinition } = require('../../../../../lib/server/services/run/getRunDefinition.js');
const { lhcFillService } = require('../../../../../lib/server/services/lhcFill/LhcFillService.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return an LHC fill for a given fill number', async () => {
        const lhcFill = await lhcFillService.get(1);
        expect(lhcFill).to.have.ownProperty('fillNumber');
        expect(lhcFill.fillNumber).to.equal(1);
    });

    it('should successfully return null when fetching an LHC fill for a non-existing fill number', async () => {
        expect(await lhcFillService.get(9999)).to.equal(null);
    });

    it('should successfully include the related runs and their definition if asked', async () => {
        const lhcFill = await lhcFillService.get(6, { runs: true });
        expect(lhcFill.runs).to.lengthOf(5);
        expect(lhcFill.runs.filter(({ definition }) => definition === RunDefinition.Physics)).to.lengthOf(4);
    });

    it('should successfully return the last LHC fill', async () => {
        const lhcFill = await lhcFillService.getLast();
        expect(lhcFill).to.have.ownProperty('fillNumber');
        expect(lhcFill.fillNumber).to.equal(6);
    });
};
